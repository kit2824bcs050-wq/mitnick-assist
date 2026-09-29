BRUTE FORCE INCIDENT GUIDANCE

Indicators:
- Repeated failed authentication attempts
- High login frequency
- Multiple authentication attempts within a short period
- Possible credential guessing activity

SOC Investigation:
- Review authentication logs
- Identify source addresses
- Check whether any login succeeded
- Review affected accounts
- Compare activity against normal authentication behavior

Response:
- Block confirmed malicious sources
- Rotate compromised credentials
- Enforce stronger authentication
- Isolate the affected system when compromise is suspected
- Continue monitoring for repeated attempts
