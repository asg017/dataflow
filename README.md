# Dataflow

A self-hosted Observable notebook editor, with support for FileAttachments, Secrets, custom standard libraries, and more!

https://user-images.githubusercontent.com/15178711/118158592-d8fd9900-b3d0-11eb-97e1-70ae97d35038.mp4

## Examples

Here are some examples of Observable notebooked created and compiled with Dataflow, along with their original source:

- [Wikpedia Pageview](https://alexgarcia.xyz/dataflow/examples/wiki-pageviews/) ([source code](https://github.com/asg017/dataflow/blob/main/examples/local/wikipedia-pageviews.ojs))
- [GitHub API Notebook](https://alexgarcia.xyz/dataflow/examples/github-api/) ([source code](https://github.com/asg017/dataflow/blob/main/examples/local/github-api.ojs))
- [Census API](https://alexgarcia.xyz/dataflow/examples/census-api/) ([source code](https://github.com/asg017/dataflow/blob/main/examples/local/census-api.ojs))

## Documentation

Check out https://alexgarcia.xyz/dataflow for documentation! Fun fact, this site is entirely build with Dataflow :eyes:

## Install

```bash
npm i -g @alex.garcia/dataflow

dataflow --help

dataflow run ./my-notebook.ojs
```

## Background

[Observable notebooks](http://observablehq.com/) are reactive, JavaScript-based computational notebooks that run inside your browser. Dataflow is one of the first fully open-sourced and fully featured Observable notebook editors, with key differences that make it easier to integrate with other developer tools!

### Edit Notebooks in "Observable JavaScript" `.ojs` files

Dataflow notebooks are files on your computer, in the form of `.ojs` files. A single `.ojs` file is analagous to a single Observable notebook, and `.ojs` files can import from other `.ojs` files.

`dataflow run my-notebook.ojs` will start a dev server at `localhost:8080` that shows a live rendered look at a notebook defined in `my-notebook.ojs`. Any update you make to the `my-notebook.ojs` file from any text editor will instantly update.

Since notebooks are file-based, they can be easily version controlled (ie git) and appear alongside your other frontend code. Dataflow can also compile these notebooks with `dataflow compile` to plain JavaScript ES modules, and generate HTML files that run a notebook locally.

### Takes advantage of local development

Since Dataflow notebooks aren't ran in a sandboxed iframe, that means you can control every aspect to how a notebook looks. Include CSS and stylesheets to change the look of it, change favicons or `document.title`, or access browser features not available for iframe like acessing Bluetooth devices or printing notebooks.

Dataflow also offers easy acess to your filesystem with file attachments. Instead manually uploading files, you can simple include a configuration comment in a notebook to the path of your FileAttachment, and Dataflow will be instantly available with the same `FileAttachment` API as observablehq.com. You can also have "live" file attachments with `LiveFileAttachment`, which updates everytime a file attachment's file updates, making it even faster to rapidily test different data sources. See documentation for [Dataflow File Attachments](https://alexgarcia.xyz/dataflow/#file-attachments) for more.

Finally, since Dataflow is just another service that runs on `localhost:8080`, you can build your own APIs and webservices that run local to your computer that Dataflow can access. You can build a proxy to your own database or query from local data apps with a little elbow grease!

### Customizable

Dataflow aims to be extensible and customizable. [Custom Standard Library](https://alexgarcia.xyz/dataflow/#custom-standard-libraries) make it easier to define new builtin cells for your notebooks, [Secrets](https://alexgarcia.xyz/dataflow/#secrets) make it easier to pass in sensitive configuration, and working with "files as notebooks" mean you can bring in whatever text editor you want.

That being said, There's still a lot of room to make Dataflow more customizable! [Custom styling](https://github.com/asg017/dataflow/issues/9), [more importing options](https://github.com/asg017/dataflow/issues/10), and [more compiling options](https://github.com/asg017/dataflow/issues/17) are planned, so watch this repo for updates!

## License

Dataflow is MIT licensed, and heavily relies on these ISC licensed libraries:

- https://github.com/observablehq/parser
- https://github.com/observablehq/runtime
- https://github.com/observablehq/stdlib
