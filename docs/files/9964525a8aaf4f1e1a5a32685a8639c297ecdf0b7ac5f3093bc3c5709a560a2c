## Secrets

Secrets can be passed in from the `dataflow run` CLI. Keep in mind, there's no encryption or anything fancy going on with Secrets, think of them as a simple way to avoid writing secrets directly in source code.

```bash
dataflow run example.ojs --allow-secrets \
    --secret API_TOKEN:$API_TOKEN \
    --secret PASSWORD:hunter2
```

```javascript
// contents of the API_TOKEN environment  variable
apiToken = Secret("API_TOKEN");

// "hunter2"
password = Secret("PASSWORD");
```

One key difference here from [observablehq.com Secrets](https://observablehq.com/@observablehq/secrets): a `Secret("key")` call returns a Promise, not the secret directly.

Secrets are not supported when compiling notebooks with `dataflow compile`.
