# Controlled HTTP failures

Use mocks only to isolate the requested HTTP-dependent behavior. Observe the actual request URL with `playwright-cli -s=check-task requests`, then select the narrow matching pattern. Record that the result came from mocked traffic.

```bash
playwright-cli -s=check-task route 'https://observed-host.example/media/image.jpg' --status=404
playwright-cli -s=check-task route-list
# Reproduce the affected media flow.
playwright-cli -s=check-task unroute 'https://observed-host.example/media/image.jpg'
```

Replace the example URL with the observed request. For a fixture response, `route` accepts `--body` and `--content-type`; conditional responses or delays can use `page.route` in `run-code`. Remove the exact owned route in cleanup, or close the task's isolated session.

These static clients receive community content from Bitsocial peers. An app-origin HTTP mock does not by itself simulate protocol data, WebSocket/RPC behavior, or service-worker-intercepted requests. Verify that the targeted request was intercepted before attributing the observed UI to the mock. Do not introduce broad `**/*` rules or strip credentials from unrelated traffic.
