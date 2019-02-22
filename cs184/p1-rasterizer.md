---
layout: cs184
---

# CS 184: Computer Graphics and Imaging, Spring 2019

# Project 1: Rasterizer

## William Gan, cs184-ado

## Overview

For this project [(link)](https://cs184.eecs.berkeley.edu/sp19/article/6/assignment-1-rasterizer), I implemented a triangle rasterizer that supports

* Different supersampling rates.
* Texture mapping.
  * Nearest and bilinear pixel sampling of textures.
  * Zero, nearest, and bilinear mipmap level sampling for antialiasing.

While this doc skims over the well-known details, it focuses on some tricky things I encountered along the way, as well as pictures and summaries of the results. Before coming into this project, I only knew rasterization as a word. However, now I think I have a good understanding of how rasterization works and implementation details / performance tradeoffs.

## Section I: Rasterization

### Part 1: Rasterizing single-color triangles

* For every pixel $$(r,c)$$ in the bounding box of the triangle **and** within the limits of the *samplebuffer*, I determined if $$(r+0.5, c+0.5)$$ was in the triangle, and colored the pixel if it was.
* To determine if the point is in the triangle, I used the method described in lecture. Here were some tricky things I ran into.
  1. **Making sure the normal vectors point inside**. First, I got normal vectors for each side

      $$n_1 = (y_0 - y_1, x_1 - x_0)$$

      $$n_2 = (y_1 - y_2, x_2 - x_1)$$

      $$v_3 = (y_2 - y_0, x_0 - x_2)$$

      By construction, the normal vectors either all pointed inside or outside. To determine which, I leveraged the fact that $$n_1$$ should have pointed in the direction of $$p_2$$. Namely the dot product of $$n_1$$ and the vector from $$p_0$$ to $$p_2$$ should have been positive. Here's a code snippet.

      ```cpp
      n1 = Vector2D(-(y1 - y0), x1 - x0);
      n2 = Vector2D(-(y2 - y1), x2 - x1);
      n3 = Vector2D(-(y0 - y2), x0 - x2);

      if (dot(n1, Vector2D(x2 - x0, y2 - y0)) < 0) {
        n1 *= -1;
        n2 *= -1;
        n3 *= -1;
      }
      ```

  2. **OpenGL Edge Rules.** Another tricky thing was to check if a normal vector corresponded to a vector that was a top edge or a left edge. For top edges, I checked to make sure that the normal vector was pointing strictly down. For a left edge, I checked to make sure the dot product of the normal vector with $$(1, 0)$$ was positive.

      ```cpp
      bool is_top1 = n1.x == 0 && n1.y < 0;
      bool is_top2 = n2.x == 0 && n2.y < 0;
      bool is_top3 = n3.x == 0 && n3.y < 0;

      bool is_left1 = dot(n1, Vector2D(1, 0)) > 0;
      bool is_left2 = dot(n2, Vector2D(1, 0)) > 0;
      bool is_left3 = dot(n3, Vector2D(1, 0)) > 0;
      ```

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part1.png" align="middle" width="480">
        <figcaption align="middle">Here is my basic/test4.svg</figcaption>
      </td>
    </tr>
  </table>
</div>

### Part 2: Antialiasing triangles

* In part 1, I sampled at $$(r+0.5, c+0.5)$$. For this part, I divided the pixel into subpixels and sampled at the center of each. The formula for the centers of the ith subpixel vertically and the jth subpixel horizontally is

  $$(r + \frac{2 \cdot i+1}{2 \cdot \text{samples_per_side}}, c + \frac{2 \cdot j+1}{2 \cdot \text{samples_per_side}})$$

  where $$i, j \in 0, 1, \dots, \text{samples_per_side}-1$$.
* At the end, I averaged every subpixel to find overall color. This way, a pixel wouldn't be just white or the color but also in between.

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part1.png" align="middle" width="400px"/>
        <figcaption align="middle">Sample rate 1, same picture as above</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part2_4.png" align="middle" width="400px"/>
        <figcaption align="middle">Sample rate 4.</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part2_16.png" align="middle" width="400px"/>
        <figcaption align="middle">Sample rate 16.</figcaption>
      </td>
    </tr>
  </table>
</div>

The pixels near the edges took intermediate values / were blurred because within a pixel, the area inside the triangle and the area outside was averaged. The blur increased with the sample rate since that led to a closer approximation of what the size those areas were.

### Part 3: Transforms

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part3_robot.png" align="middle" width="400px"/>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part3.png" align="middle" width="400px"/>
      </td>
    </tr>
  </table>
</div>

For my cubeman, I changed the body blocks to black and the face to white. For the eyes, I took the torso code and translated / scaled it. For the moustache, I translated and drew a triangle. I later figured out the right scale of triangle. Because I knew the coordinates from the torso, I drew the white shirt manually. For the bowtie, however, I translated and rescaled similar to how I did the moustache.

## Section II: Sampling

### Part 4: Barycentric coordinates

The idea behind barycentric coordinates is that we can express points inside the triangle in terms of the triangle's vertices. In particular, if a triangle's vertices are $$A = (x_A, y_A)$$, $$B = (x_B, y_B)$$, $$C = (x_C, y_C)$$, we can write

$$(x,y) = \alpha A + \beta B + \gamma C$$

where $$0 \leq \alpha, \beta, \gamma \leq 1$$. Furthermore, we can do so in a way such that

$$\alpha + \beta + \gamma = 1$$

The advantage of this representation is that since the coordinates are from 0 to 1 and add up to 1, they tell us relatively how "similiar" each point in the triangle is to each of the 3 vertices.

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part4_vertices.png" align="middle" width="400px"/>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part4_fill.png" align="middle" width="400px"/>
      </td>
    </tr>
  </table>
</div>

The two pictures above show how you can fill in a triangle with vertices colored red, green, and blue. For each point inside the triangle, we use its barycentric coordinate to determine what percent it is red, green, and blue.

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part4_wheel.png" align="middle" width="400px"/>
        <figcaption align="middle">Color wheel generation.</figcaption>
      </td>
    </tr>
  </table>
</div>

### Part 5: "Pixel sampling" for texture mapping

* In Part 4, if a screen (sub)pixel was in a triangle, I would convert it to barycentric coordinates and then send it to a ColorTri. ColorTri would use the coordinate values to return a weighted average of the ColorTri's 3 vertex colors.
* In this part, I sent the barycentric coordinates to a TexTri. Instead of just being 3 vertices with 3 colors, a TexTri is actually a triangle-shaped image stored in a different file.
* Using the barycentric coordinates, I figured out the corresponding texture pixel (texel). To recap, a screen pixel $$(x,y)$$ inside a triangle can be expressed as
  
  $$(x,y) = \alpha A + \beta B + \gamma C$$

  where $$0 \leq \alpha, \beta, \gamma \leq 1$$ and $$\alpha + \beta + \gamma = 1$$. The vertices of the triangle in the texture file ($$E$$, $$F$$, $$G$$) can be used to find the texel $$(u,v)$$.

  $$(u,v) = \alpha E + \beta F + \gamma G$$

  However, the issue is that the texture file is still made up of a pixels, meaning $$(u,v)$$ is supposed to be made up of whole numbers. There are two ways to fix this.
  * *Nearest*: Truncate (Floor) $$(u,v)$$ so that they become whole numbers and take the color value there.
  * *Bilinear*: $$(u,v)$$ is bounded by the square with the following corners.

    $$\{ (\lfloor u \rfloor, \lfloor v \rfloor), (\lfloor u \rfloor, \lceil v \rceil), (\lceil u \rceil, \lfloor v \rfloor), (\lceil u \rceil, \lceil v \rceil) \}$$

    Similar to how in ColorTri we use barycentric coordinates to average the RGB of the triangle's 3 vertices, something similar can be done here to average the RGB of the 4 corners.

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part5_nearest_1.png" align="middle" width="400px"/>
        <figcaption align="middle">Nearest pixel sampling. Supersampling rate: 1.</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part5_bilinear_1.png" align="middle" width="400px"/>
        <figcaption align="middle">Bilinear pixel sampling. Supersampling rate: 1.</figcaption>
      </td>
    </tr>
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part5_nearest_16.png" align="middle" width="400px"/>
        <figcaption align="middle">Nearest pixel sampling. Supersampling rate: 16.</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part5_bilinear_16.png" align="middle" width="400px"/>
        <figcaption align="middle">Bilinear pixel sampling. Supersampling rate: 16.</figcaption>
      </td>
    </tr>
  </table>
</div>

For rendering the globe image, the latitude and longitude lines were hard to get right. With nearest pixel sampling, they appeared faded out / disconnected at times. However, with bilinear sampling, they appeared smooth and connected. In fact, bilinear pixel sampling at supersampling rate 1 was better than nearest pixel sampling at rate 16.

### Part 6: "Level sampling" with mipmaps for texture mapping

When rendering, we sample to determine a pixel value. One seemingly unimportant detail is that we sample at the same rate for every pixel. But a single pixel can map to a region of arbitrary area in the texture file. Furthermore these areas will be different. So we might need to sample in the texture file at different rates.

We could adjust our super sampling rate, but there is an efficiency tradeoff. There are also other techniques we can do to fix this. One, which is level sampling, is to store the texture file at different resolutions. If the original texture file was 128 x 128 texels, I could also make it 64x64 by averaging every 2x2 block into 1 texel. If a screen pixel maps to a large area in the texture file, I should sample from the smaller texture files, because that texture file inherently averages texels value for us, which supersampling would do. We want to store many levels (128 x 128, 64 x 64, 32 x 32, etc.) and figure out the best level to sample from when rendering.

Here's how I calculated the Mipmap level

```cpp
float Texture::get_level(const SampleParams &sp) {
  // Optional helper function for Parts 5 and 6

  double du_dx = sp.p_dx_uv[0] * width;
  double dv_dx = sp.p_dx_uv[1] * height;
  double du_dy = sp.p_dy_uv[0] * width;
  double dv_dy = sp.p_dy_uv[1] * height;

  double l1 = std::sqrt(du_dx*du_dx + dv_dx*dv_dx);
  double l2 = std::sqrt(du_dy*du_dy + dv_dy*dv_dy);
  double l = std::max(l1, l2);
  return std::log2(l);
}
```

Here's a table of the average FPS for each technique.

|                | Nearest Sampling | Bilinear Sampling|
| Zero Level     | 100 FPS          | 90 FPS           |
| Nearest Level  | 90 FPS           | 80 FPS           |
| Bilinear Level | 80 FPS           | 70 FPS           |

<div align="middle">
  <table style="width=100%">
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part6_zero_nearest.png" align="middle" width="400px"/>
        <figcaption align="middle">Zero level. Nearest pixel sampling.</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part6_zero_bilinear.png" align="middle" width="400px"/>
        <figcaption align="middle">Zero level. Bilinear pixel sampling.</figcaption>
      </td>
    </tr>
    <tr>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part6_nearest_nearest.png" align="middle" width="400px"/>
        <figcaption align="middle">Nearest level. Nearest pixel sampling</figcaption>
      </td>
      <td>
        <img src="/assets/cs184/p1-rasterizer/part6_nearest_bilinear.png" align="middle" width="400px"/>
        <figcaption align="middle">Nearest level. Bilinear pixel sampling.</figcaption>
      </td>
    </tr>
  </table>
</div>

Not that easy to tell at this level of zoom, but the zero level, nearest pixel sampling had the highest level of sharpness, followed by zero level, bilinear pixel sampling and then the nearest level techniques. At the same time, sharpness also came with jaggies / moire (although since this picture is a mountain it sort of blends in). Overall, I learned that unless the zoom is very far out, zero level, nearest pixel was still the best for images like this.