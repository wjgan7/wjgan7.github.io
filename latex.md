---
layout: page_with_toc
title: LaTeX EECS
toc: true
---

# LaTeX Reference for EE/CS Classes

Below are some common LaTeX commands I find myself using for various EE/CS
classes.

## General Shortcuts

These are commands you would define in the preamble.

```tex
\documentclass{article}
\usepackage{amsmath}

% COMMANDS GO HERE

\begin{document}
```

| Name | Command | Example | Output |
| ---  | ------- | ------- | ------ |
| Absolute Value | `\newcommand{\abs}[1]{\lvert #1 \rvert}` | `\abs{x}` | $$\lvert x \rvert$$ |
| Big Absolute Value | `\newcommand{\bigabs}[1]{\Bigl \lvert #1 \Bigr \rvert}` | `\bigabs{\frac{x}{2}}` | $$\Bigl \lvert \frac{x}{2} \Bigr \rvert$$ |
| Big Bracket | `\newcommand{\bigbracket}{\Bigl [ #1 \Bigr ]}` | `\bigbracket{\frac{1}{2}x^2}_{x=0}^{x=1}}` | $$\Bigl [ \frac{1}{2}x^2 \Bigr ]_{x=0}^{x=1}$$ |
