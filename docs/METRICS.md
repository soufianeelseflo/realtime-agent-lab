# Metrics

## Latency
For each `user.speech.end`, find the next related `agent.response.start`. P95 above 400 ms loses one point per 16 ms until zero.

## Interruption
An interruption succeeds when `agent.response.stop` occurs within 1000 ms of `user.interruption`.

## Tool reliability
Successful tool results divided by calls. A claimed success without `ok: true` incurs an additional 25-point penalty.

## Duplication
Identical completed agent text within five seconds is a duplicate and costs 35 points.

## Reconnect
A connection failure is recovered when `connection.opened` occurs within five seconds.

## Consent
Capture and user speech events require active consent. Each violation costs 50 points.

## Privacy
Explicit privacy events and detected secrets each cost 25 points.

## Composite score
Latency 20%, interruption 20%, tools 20%, duplication 10%, reconnect 10%, consent 10%, privacy 10%.
