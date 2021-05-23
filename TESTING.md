## Testing

Automated tests are hard :(

for actual automated tests, a few ideas:

- node script that turns on/off a dev serverw/ different params
- puppeteer script that actuallys runs the code/exposes runtime to test vlaues

```bash
# stdlib
./src/dataflow run ./test/stdlib/colors.ojs --stdlib ./test/stdlib/colors1.js --no-open
./src/dataflow run ./test/stdlib/colors.ojs --stdlib ./test/stdlib/colors2.js --no-open
./src/dataflow run ./test/stdlib/async.ojs --stdlib ./test/stdlib/async.js --no-open
./src/dataflow run ./test/stdlib/funcs.ojs --stdlib ./test/stdlib/funcs.js --no-open


# FileAttachments
./src/dataflow run ./test/file-attachments/normal.ojs --allow-file-attachments --no-open
./src/dataflow run ./test/file-attachments/live.ojs --allow-file-attachments --no-open

# Secrets
export TOKEN=abc123; ./src/dataflow run ./test/secrets/normal.ojs --secret PASSWORD:hunter2 --secret TOKEN:$TOKEN --allow-secrets --no-open

# Error handling
src/dataflow run ./test/errors/parsing.ojs --no-open

# imports
src/dataflow run ./test/imports/top.ojs --no-open

src/dataflow run ./test/builtins/width.ojs --no-open

# compiling
rm -rf ./test/export/dist || true; src/dataflow compile ./test/export/top.ojs ./test/export/dist --bundle

```
