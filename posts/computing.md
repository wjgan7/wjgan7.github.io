---
layout: post
title: Computation
toc: true
---

# Computing Probabilities and Expectations

Coding is pretty underrated when it comes to a subject like probability. EECS 126 is so focused on math that the importance of, e.g. being able to simulate a random process, is often lost.

## Motivation

### Fall 2015 MT1 1(e)

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

our expected answer based on the formula $$\frac{51}{100}Y$$ and the actual empirical $$E[Z \mid Y]$$ don't match up. Even though they only differ by a slight amount (50.49 vs 50.27), that's 24 standard deviations given the fact we had 197,588 samples. And since the CLT tells us that our empirical $$E[Z \mid Y]$$ will be normally distributed around its true value, 24 standard deviations away basically happens with 0 probability.

The issue ends up being very subtle, but it relates to the fact that $$\sum_{i \not = j} E[X_i \mid Y]$$ doesn't make sense since $$j$$ is random. It's not pretty, but the correct answer ends up being

$$E[Z \mid Y] = \frac{\frac{Y(Y-1)}{2} ((Y+1)^{49} - Y^{49}) + Y(Y+1)^{49}}{(Y+1)^{50} - Y^{50}}$$

A derivation of that is in this [Jupyter Notebook](/assets/computing/fa15mt1q1e.ipynb), which also has the full code.

### Shuffled Deck Problem

Code can also guide us to answers. Consider this problem:

> You have a randomly shuffled deck of cards labeled 1 to N. You keep drawing cards from the top of the deck while the numbers increase. What is expected sum of this increasing run?

The answer to this question is elegant, but it turns out finding it mostly involves algebraic bashing. In fact, it's really hard to derive the answer without knowing it in the first place. This is where code comes in.

```python
def score(tup):
    if len(tup) == 0:
        return 0
    s = tup[0]
    i = 1
    while i < len(tup) and tup[i] > tup[i-1]:
        s += tup[i]
        i += 1
    return s
```

```python
import itertools
import math

for N in range(1, 10):
    s = 0
    for permutation in itertools.permutations(range(1, N+1)):
        s += score(permutation)
    print(f'N: {N} Expectation: {s / math.factorial(N)}')
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
Here's how you can derive the answer. Credits to fellow TA Efe and his friend Forest.
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

## Overview

When it comes to computing probabilities and expectations, it's ususally either Monte Carlo or brute force / dynamic programming.

### Monte Carlo method

Monte Carlo kind of just means randomly simulating a process and averaging results to calculate a value. For example, one of the classic ways to approximate $$\pi$$ is to randomly throw darts at square and see what proportion of them lie in a quarter-circle. If we let $$Z_i$$ be an indicator random variable for a whether dart is in the quarter-circle, we know that

$$P(Z_i = 1) = \frac{\text{Area of quarter-circle}}{\text{Area of square}} = \frac{\frac{1}{4} \cdot \pi \cdot 1^2}{1 \cdot 1} = \frac{\pi}{4}$$

And since we know that the proportion of darts in the circle, $$\frac{1}{N} \sum\limits_{i=1}^N Z_i$$, converges to its expectation, $$\frac{\pi}{4}$$, by the LLN / CLT, that means if we have enough samples we can approximate $$\pi$$ as 4 times that proportion.

<div align="middle">
  <img src="/assets/computing/monte_carlo.gif" width="500px" height="500px">
</div>

#### np.random.rand()

When it comes to Monte Carlo, the tools you'll be using mostly involve the `np.random` module. The most important of which is `np.random.rand` (or `np.random.random_sample`, `np.random.random`, etc., they all do the same thing).

```python
np.random.rand(d0, d1, ..., dn)
```

`np.random.rand(10)` creates a length 10 array of random floats between $$[0, 1)$$. `np.random.rand(3, 3)` does that but for a $$3 \times 3$$ matrix. `np.random.rand()` just returns one random float.

Here's the approximation to $$\pi$$ using this function.

```python
import numpy as np

SAMPLES = 100000

# x and y coordinate for each sample
points_on_square = np.random.rand(SAMPLES, 2)
# d^2 = x^2 + y^2
distance_squared = np.sum(np.square(points_on_square), axis=1)
# 1 if d^2 <= 1, 0 otherwise
z = np.where(distance_squared <= 1, 1, 0)
proportion = sum(z) / len(z)
print(f'Pi: {4 * proportion}')
```

`np.random.rand` is also important because you can basically sample from any continuous distribution with it so long as you know the inverse of the CDF, $$F^{-1}(x)$$. For example for an exponential random variable $$F(x) = 1 - e^{-\lambda x}$$, so if we wanted to generate a random $$x$$ we could let $$u$$ be a random number from $$[0, 1)$$ and then set $$1 - e^{- \lambda x} = u$$, or $$x = - \frac{\ln (1 - u)}{\lambda}$$. It turns out that if we follow this procedure, the $$x$$'s we generate will be distributed exponentially.

Here are some exercises you might want to try.

* Uniformly randomly generate a point in a circle of radius $$r$$.
* Uniformly randomly generate a point on a sphere of radius $$r$$.
* Uniformly randomly generate a point in the region between two circles of radii $$r_1$$ and $$r_2$$.

#### Other Things About np.random

Another important method is `np.random.randint`. `np.random.randint(6) + 1` randomly generates a dice roll from 1 to 6. `np.random.randint(2000, 2020)` randomly generates a year from 2000 to 2019, but does not include 2020. You can do `np.random.randint(1, 7, size=100)` to randomly generate 100 dice rolls.

Here's a [full list](https://docs.scipy.org/doc/numpy/reference/routines.random.html) of the functions in the `np.random` module. It includes functions for sampling from common distributions directly, e.g. exponential.

#### Fallbacks of Monte Carlo

We do Monte Carlo in the Fall 2015 MT1 1(e) code: we essentially simulate 50 rolls and then look at the average. But our code is not that efficient because we're looking for a conditional expectation, i.e. we only care about the average roll given the max roll. That's why even though we generate 500,000 samples, only 197,588 are used for when we're looking at $$E[Z \mid Y = 99]$$. For smaller max rolls, the issue becomes more severe. For example the probability of the max roll being at most 49 is $$(\frac{50}{100})^{-50} = 2^{-50}$$, so we'll basically never get even get one sample for cases where $$Y \leq 49$$.

Even when we are able to use all of our samples though, Monte Carlo still isn't great. For example the code above that uses 100,000 samples to approximate $$\pi$$ returns 3.14984, which isn't even accurate to the 3rd digit.

*Note: sometimes you can be smarter about Monte Carlo in that you don't waste many samples, but that's not the case here*.

### Brute Force / Dynamic Programming

This is where the second technique come in. Sometimes it's possible to enumerate (i.e. brute force) over all outcomes and calculate the expectation exactly. For example, in the Shuffled Deck Problem, in order to figure out the expected length of the first run, we enumerated over all $$N!$$ ways that the deck could have been shuffled and calculated the run length for each one. Since each permutation of the deck was equally likely, we simply averaged all these run lengths in the end to produce the expectation.

#### itertools

For these combinatorial brute forces, the tools you typically want to use are in Python's `itertools` library. The documentation is [linked here](https://docs.python.org/3/library/itertools.html), but the important functions are:

* `itertools.product`. This returns a generator for Cartesian products.
  * `itertools.product(['H', 'T'], repeat=4)` will return all possible outcomes from 4 coin flips.
  * `itertools.product(['H', 'T'], range(1, 7))` will return all possible outcomes of a coin flip then a dice roll.
* `itertools.permutations`. This returns a generator for permutations.
  * `itertools.permutations(range(1, N+1))` will return all permutations of integers 1 to $$N$$, which we used in the Shuffled Deck Problem.
  * `itertools.permutations(['Argentina', 'Belgium', 'Brazil', 'England', 'France', 'Germany', 'Portugal', 'Spain'], r=3)` will return every 3-permutation out of these 8 options, maybe representing the Top 3 at the World Cup.
* `itertools.combinations`. This returns a generator for combinations, and it basically acts the same way as permutations.

#### Fallbacks of Brute Force

The issue with brute force is of course, you're brute forcing. It isn't feasible for Fall 2015 MT1 1(e) because there are $$100^{50}$$ ways roll a 100-sided die 50 times. Even for the shuffled deck problem, it isn't really be feasible for $$N$$ greater than 10. When this issue occurs, we sometimes need to fall back on Monte Carlo. But actually sometimes we don't need to because there's a recurrence going on. And in those cases we can take advantage of dynamic programming.

#### Dynamic Programming

We can't brute force Fall 2015 MT1 1(e) because there are $$100^{50}$$ outcomes. But let's look at the problem. It's hard because we're saying the max is $$Y$$. This means that every roll is at most $$Y$$ **and** there is at least one roll equal to $$Y$$. If it were just that every roll is at most $$Y$$, the expected average would just be $$\frac{Y}{2}$$. However, it turns out there is a recurrence relation that makes the max case simple as well.

Say we let $$f(n)$$ be the expected **sum** of $$n$$ rolls given that the max of these $$n$$ rolls is $$Y$$. $$E[Z \mid Y]$$ is the expected **average** with $$n = 50$$, so our "answer" is $$\frac{1}{50} f(50)$$. $$f(n)$$ is nice because if we let $$p(n)$$ be the probability that the $$n$$-th roll is a $$Y$$, then

$$
f(n) = p(n) \cdot (Y + (n-1) \cdot \frac{Y}{2}) + (1 - p(n)) \cdot (\frac{Y-1}{2} + f(n-1))
$$

The reasoning behind this formula is as follows. If the $$n$$-th roll is a $$Y$$, then we don't need to worry about there being at least one roll equal to $$Y$$ for the remaining $$n-1$$ rolls, and the expected sum is  the $$Y$$ we rolled plus the expected sum of $$n-1$$ rolls that are at most $$Y$$, which is $$(n-1) \cdot \frac{Y}{2}$$. On the other hand, if the $$n$$-th roll is not a $$Y$$, then its expectation is $$\frac{Y-1}{2}$$, and the expected sum of the remaining rolls is $$f(n-1)$$.

So what's $$p(n)$$? The answer is

$$p(n) = \frac{(Y+1)^{n-1}}{(Y+1)^n - Y^n}$$

There are $$(Y+1)^n$$ ways roll a die $$n$$ times such that every roll is at most $$Y$$. Of those, there are $$Y^n$$ ways roll a die $$n$$ times such that every role is at most $$Y-1$$, in which case there won't be at least one roll equal to $$Y$$. So the number of ways to roll the die such that the max is $$Y$$ is $$(Y+1)^n - Y^n$$. Of those, there are $$(Y+1)^{n-1}$$ ways to roll such that the $$n$$-flip is a $$Y$$, since if it is, then the other $$n-1$$ rolls just need to be at most $$Y$$.

Here's the code calculating $$E[Z \mid Y = 99]$$ using the recurrence relation above.

```python
import numpy as np

f = np.zeros(51)
f[0] = 0

Y = 99

for n in range(1, 51):
    p = (Y+1)**(n-1) / ((Y+1)**n - Y**n)
    f[n] = p * (Y + (n-1) * Y/2) + (1-p) * ((Y-1)/2 + f[n-1])

print(f'E[Z | Y={Y}]: {f[50]/50}')
```

<div>
  <img src="/assets/computing/dp_output.png" width="293px" height="34px">
</div>

This code is a lot more efficient than the Monte Carlo version, computes the **exact** answer, and also works for different values of $$Y$$.

Dynamic programming is pretty hard: it's not easy to see the "state", the recurrence, or figure out $$p(n)$$. But the takeaway is that it can enable us to compute probabilities and expectations in an efficient matter. Furthermore, you get a lot better at figuring these states and recurrences with practice and the common ways to recurse.

<!-- Here are some exercises you might want to try. -->

## Conclusion

Code can be useful for verifying and finding answers. Actually, there are some problems that don't have closed-form solutions but can still be approximated with Monte Carlo simulation or computed exactly with brute force / dynamic programming. In general these two techniques represent contrasting ways to compute probabilites and expectations. Monte Carlo simulation is easy to implement but is often inefficient and will only give you rough answers. Brute force / dynamic programming will give you exact answers, and dynamic programming in particular is efficient. However, this comes at the cost of being hard to implement and bug prone, and not all problems can be solved in such a manner. Getting good at both can improve your understanding of probability and is also pretty useful practically.