# Streaming

## Objectives

- Stream data

## The one tradeoff with ssr

We talked about the SPA tradeoff. It sucked when the user browsed to our app and saw this

<img alt="SPA Flow" src="./img/1_img1.png" width="500" />

This happened before our initial render only, essentially, rendered a shell for our app with a loading spinner.

It rendered this quickly, for sure, but the requests for data did not happen until that initial response was received, and our browser parsed, and executed our javascript. Only then did our requests for data fire.

SSR is cool because instead of a loading spinner, our browser renders full content from that initial response.

<img alt="SSR Flow" src="./img/1_img3.png" width="500" />

### What are we assuming though?

Until that initial render, this is what the user sees.

<img alt="Browser waiting" src="./img/6_img1.png" width="500" />

SPAs always render fast, but show useless content (like a spinner) until the data are finished loading.

An equivalent apps with SSR will always render the final product sooner (since the data loading starts sooner), but the user may see _nothing_ for an uncomforablt amount of time.

Can we get the best of all worlds?

## Streaming

**START** loading the data on the server, but render the rest of the page (possibly just a spinner) immediately.

When the data finish loading, the server _pushes_ it down.

Best of all worlds.

<img alt="Browser waiting" src="./img/6_img2.png" width="500" />

This is your feature to use. Use it as much, or as little as you want.

But don't over use it.

Too many pieces of data plopping into existence can create a jarring effect for the user.
