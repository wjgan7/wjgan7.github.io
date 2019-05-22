---
layout: post
title: Computation
toc: true
---

# Computing Probabilities and Expectations

Coding is pretty underrated when it comes to a subject like probability. EECS 126 is so focused on the math that the importance of, e.g. being able to simulate a random process, is often lost.

## Motivation

### Fall 2015 1(e)

Code is illuminating because it can verify answers. For example, here's the question and solution for [1(e) on Midterm 1 of Fall 2015](/assets/computing/fa15_sol.pdf).

<div align="middle">
  <img src="/assets/computing/q1e.png" align="middle" width="680px" height="321px">
</div>

The answer is intuitive -- it invokes "symmetry" -- but if we run this code segment which simulates the random process

```python
import numpy as np
trials = [[] for _ in range(100)]
for _ in range(500000):
    rolls = np.random.randint(100, size=50)
    max_roll = np.max(rolls)
    trials[max_roll].append(np.mean(rolls))

Y = 99
expected = 0.51*Y
actual = np.mean(trials[Y])
std = np.std(trials[Y])/samples**0.5
print(f'Y={Y} samples={samples}\n' +
      f'expected:{expected : .3f} actual {actual : .6f}\n'+
      f'std: {std :.6f} error: {abs(expected-actual)/std: 0.6f} standard deviations\n')
```

<div>
  <img src="/assets/computing/output.png" width="649px" height="77px">
</div>

our expected answer based on the formula $$\frac{51}{100}Y$$ and the actual empirical $$E[Z \mid Y]$$ don't match up. Even though they only differ by a slight amount (50.49 vs 50.27), that's 24 standard deviations given the fact we had 197588 samples. And since the CLT tells us that our empirical $$E[Z \mid Y]$$ will be normally distributed around its true value, 24 standard deviations away basically happens with 0 probability.

The issue ends up being very subtle, but it relates to the fact that $$\sum_{i \not = j} E[X_i \mid Y]$$ doesn't make sense since $$j$$ is random. The correct answer ends up being

$$E[Z \mid Y] = \frac{\frac{Y(Y-1)}{2} ((Y+1)^{49} - Y^{49}) + Y(Y+1)^{49}}{(Y+1)^{50} - Y^{50}}$$

A derivation of that is in this [Jupyter Notebook](/assets/computing/fa15mt1q1e.ipynb), which also has the full code.

### Shuffled Deck Problem

Code can also guide us to answers. Consider this problem that we were considering putting on the Spring 2019 Final:

> You have a randomly shuffled deck of cards labeled 1 to N. You keep drawing cards from the top of the deck while the numbers increase. What is expected sum of this increasing run?

The answer to this question is elegant, but it turns out finding it mostly involves algebraic bashing with factorials. In fact, it would probably be very hard to get a derivation for the answer without knowing it in the first place. This is where code comes in.

```python
def score(tup):
    if len(tup) == 0:
        return 0
    i = len(tup) - 1
    s = tup[i]
    while i > 0 and tup[i-1] > tup[i]:
        s += tup[i-1]
        i -= 1
    return s
```

```python
import itertools
import math

for N in range(1, 10):
    s = 0
    for permutation in itertools.permutations(range(1, N+1)):
        s += score(permutation)
    print(s / math.factorial(N))
    print(N + 1 - 1 / math.factorial(N))
```

<div>
  <img src="/assets/computing/shuffled_deck_output.png" width="469px" height="177px">
</div>

The answer gets increasingly close to $$N+1$$ as $$N$$ gets larger. We can see that it is off by $$\frac{1}{2}$$ for $$N=2$$ and $$\frac{1}{6}$$ for $$N=3$$. It turns out it's $$\frac{1}{24}$$ for $$N=4$$, and which leads us to realize that it's off by $$\frac{1}{N!}$$. The answer ends up being

$$N+1 - \frac{1}{N!}$$

How you derive that is still hard, but knowing the answer helps, especially as you can use Wolfram Alpha to see if intermediate formulas are equal to the answer.

<details>
<br>
<summary>
Here's how you can derive the answer.
</summary>

If we let $$S$$ be the sum of the run and $$X_k = \begin{cases} \text{the label of the $k$-th card} & \text{if it is in the run} \\ 0 & \text{otherwise} \end{cases}$$. Then

$$
\begin{align*}
  E[S] & = \sum_{k=1}^N E[X_i] \\
  & = \sum_{k=1}^N P(\text{$X_k$ is bigger than $X_{k-1}, \dots, X_{1}$}) \cdot E[X_k \mid \text{$X_k$ is bigger than $X_{k-1}, \dots, X_{1}$}] \\
  & = \sum_{k=1}^N \frac{1}{k!} E[X_k \mid \text{$X_k$ is the max of the first $k$}] \\
  & = \sum_{k=1}^N \frac{1}{k!} \cdot \Bigl[ k + \frac{k}{k+1} \cdot (N-k) \Bigr] \\
  & = \sum_{k=1}^N \frac{1}{k!} \cdot \frac{k^2 + k + Nk - k^2}{k+1} \\
  & = \sum_{k=1}^N \frac{Nk + k}{(k+1)!} \\
  & = (N+1) \sum_{k=1}^N \frac{k}{(k+1)!} \\
  & = (N+1) \sum_{k=1}^N \Bigl[ \frac{1}{k!} - \frac{1}{(k+1)!} \Bigr] \\
  & = (N+1) \Bigl[ \Bigl( \frac{1}{1!} - \frac{1}{2!} \Bigr) + \dots + \Bigl( \frac{1}{N!} - \frac{1}{(N+1)!} \Bigr) \Bigr] \\
  & = (N+1) \cdot \Bigl( 1 - \frac{1}{(N+1)!} \Bigr) \\
  & = N + 1 - \frac{1}{N!}
\end{align*}
$$

</details>
<br>

## Tips and Tricks