---
layout: post
title: Don't be a Sheep
---

# Don't be a Sheep

## Game

At my local bar trivia spot, there's a game called Don't be a Sheep, where a question such as

> Name a US President that was formerly a Vice President

is asked, and the goal is to choose an answer different from other teams' answers. You get

- 0 points if your answer is incorrect
- 1 point if your answer is correct but is shared by 2 or more teams
- 2 points if your answer is correct but shared by one other team
- 3 points if your answer is correct and shared with no other teams

Typically these questions have around 10-15 answers with around 15-20 teams participating.

## Strategy

An intuitive strategy is to put the most obscure answer you can think of. For the above question,
answers such as Martin van Buren, Millard Fillmore, and Calvin Coolidge might check that box. But
more often that not, these answers don't get 3 points and may even get 1 point, because it turns out
people at trivia are quite smart and usually another team guesses it thinking they also found the
answer no one else thought of.

What about then guessing the obvious answer for reverse psychology? From the trivia nights I have
been to, this has worked a few times but has failed just as many when teams caught on. For example,
one week the question was

> Name 1 of the 10 last U.S. states to be admitted to the Union

An obvious answer to this question was Hawaii and it ended up being put by multiple teams.

## Game Theory

Don't be a Sheep is a game theory problem and it has a game theory optimal strategy i.e. [Nash
equilibrium](https://en.wikipedia.org/wiki/Nash_equilibrium). In the case where every team knows
every answer, the equilibrium is for every team to **choose the answer uniformly randomly**. This
seems to be a decent strategy in practice and it saves your team a lot of stress. However, if some
teams don't know an answer, how does the strategy change?

Let's take a simplified scenario where there are only 3 teams and 3 answers. Additionally, let's
simplify the point structure so that you get 1 point if you have the unique answer but 0 points
otherwise. In this situation, teams 1 and 2 know all 3 answers, but team 3 only knows answers 1 and
2. What is the Nash equilibrium of this game?

<div align="middle">
![Alt text](image.png)
  <img src="/assets/sheep/simplified_sheep_game.png" align="middle" width="400px">
</div>

In the above diagram, each ? represents the probability that a team $$T$$ chooses an answer $$A$$.
As probability sums up to 1, the rows should sum up to 1. For the Nash equilibrum, symmetry makes
things easier to compute. In this game, because $$A_1$$ and $$A_2$$ are identical from the POV of
$$T_3$$, they should choose $$A_1$$ and $$A_2$$ each with probability 1/2. Similarly, $$T_1$$ should
choose $$A_1$$ and $$A_2$$ with the same probability, but with what probability is unknown so we
denote it with $$x$$. For the probability that $$T_1$$ chooses $$A_3$$, that will be $$1 - 2x$$
utilizing the fact that the row should sum up to 1. Finally, $$T_1$$ and $$T_2$$ should have the
same strategies given they know the same answers, so $$T_2$$ should have the same probabilities.

<div align="middle">
![Alt text](image.png)
  <img src="/assets/sheep/simplified_sheep_nash.png" align="middle" width="400px">
</div>

For the best value of $$x$$, it is the one that maximizes the expected value of the payoff for
$$T_1$$ / $$T_2$$. The expected value of the payoff for $$T_1$$ is

$$
\begin{align*}
E[\text{Payoff for $T_1$}] &= 1 * P(\text{$T_1$ has unique answer}) + 0 * P(\text{$T_1$ does not have unique answer}) \\
&= P(\text{$T_1$ has unique answer})
\end{align*}
$$

For the probability that $$T_1$$ has a unique answer, it is illustrated in the diagram and can be
calculated as

<div align="middle">
![Alt text](image.png)
  <img src="/assets/sheep/simplified_sheep_prob.png" align="middle" width="800px">
</div>

$$
\begin{align*}
P(\text{$T_1$ has unique answer}) &= P(\text{$T_1$ guesses $A_1$ and no on else guesses $A_1$}) + P(\text{$T_1$ guesses $A_2$ and no on else guesses $A_2$}) + P(\text{$T_1$ guesses $A_3$ and no on else guesses $A_3$})
&= x(1-x)(1/2) + x(1-x)(1/2) + (1-2x)(2x) \\
&= x(1-x) + (1-2x)(2x) \\
&= x - x^2 + 2x - 4x^2 \\
&= 3x - 5x^2
\end{align*}
$$

$$3x - 5x^2$$ is a downwards-facing parabola, and its maximum can be found by setting the derivative
to 0. $$3 - 10x = 0$$ leads to an answer of 0.3

## Conclusion

In the experiment above, the ideal strategy for team 1 and team 2 was to select answers 1 and 2 30%
of the time and answer 3 slightly more often at 40% of the time. So the game theory optimal strategy
is to do random with higher weight for obscure answers. In a real game though, I still like
uniformly at random, since you can be wrong about what's obscure and also teams will be in general
be over-biased towards obscure answers, so we should exploit that. Don't be a sheep!
