## Executable Notebooks (aka shebang)

Observable notebooks in Dataflow can be defined in executable files, making it easier to manage a fleet of notebooks at the same time. If you're tired to re-typing `dataflow run notebook.ojs --allow-file-attachments` all the time, then this will make your life a tad easier!


For example, let's say that you have a directory of notebooks that each explore a different aspect of your personal finances: `loans.ojs`, `investments.ojs`, `loan.ojs`, and `spending.ojs`. If you wanted to run `dataflow run` on each of these, you'd have to type a lot: `dataflow run <filename>.ojs`, unique ports with `-p $PORT`, `--allow-file-attachments` and whatever other flags you need. 

Or instead, you can add the follow shebangs to the first line of those notebooks:

```
$ head *
==> income.ojs <==
#!/usr/bin/env dataflow run --allow-file-attachments -p 2001
/*
FileAttachments:
  jobs.csv: ./data/jobs.csv
*/

==> investments.ojs <==
#!/usr/bin/env dataflow run --allow-file-attachments -p 2002
/*
FileAttachments:
  stocks-2021.csv: ./data/stocks-2021.csv
*/

==> loans.ojs <==
#!/usr/bin/env dataflow run --allow-file-attachments -p 2003
/*
FileAttachments:
  student_loans.csv: ./data/student_loans.csv
  mortgage_payments.csv: ./data/mortgage_payments.csv
*/

==> spending.ojs <==
#!/usr/bin/env dataflow run --allow-file-attachments -p 2004
/*
  spending2021.csv: ./data/spending-2021.csv
  spending-historical.csv: ./data/spending-historical.csv
*/
```

Give those files user execution permissions:
```
chmod u+x *.ojs
```

And then run those files directly, no extra calls necessary!

```
./income.ojs
./investments.ojs
./loans.ojs
./spending.ojs
```

There will now be 4 seperate `dataflow run` devservers running, on ports 2001 (`income.ojs`), 2002 (`investments.ojs`), 2003 (`loans.ojs`), and 2004 (`spending.ojs`). 

Note: I don't think Windows support executing files with a shebang, but I'd love to be proven wrong! 

### Shebang Guide

#### 1) Add the `#!/usr/bin/env dataflow run` interpretive directive

At the top of your `.ojs` file, add the following:

```
#!/usr/bin/env dataflow run
```

This is the "interpretive directive", aka the [shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29), that your shell (bash, fish, zsh, etc.) will use to determine how to run a given file. `/usr/bin/env` will execute the `dataflow` script that's on your `$PATH` with whatever arguments are passed in. If your notebook requires extra arguments, like `--allow-file-attachments`, than can be added after `dataflow run` on the same line. It is reccommended that you also add value for the `--port/-p` option, to ensure that your executable notebooks doesn't conflict with another notebook using the default port. 

```
#!/usr/bin/env dataflow run --allow-file-attachments -p 3304
/*
FileAttachments:
  whatever.csv: whatever.csv
*/

md`# title`

data = FileAttachments('whatever.csv').csv()
```

It's important that the shebang line is the very first line. Any Dataflow-specific configuration comments (ie the `FileAttachments` YAML config) should appear in the 2nd line right after.

#### 2) Give your `.ojs` file user executable permissions

Your shell will expect executable files to have execute permissions, which can be given like so:

```
chmod u+x notebook.ojs
```

*Translation: "change the file mode of the 'notebook.ojs' file and grant e**x**ecutable permission to the **u**ser."*


#### 3) Execute your notebooks!

Now you can run your notebooks with just the filename:

```
$ ./notebook.ojs
```

And it will run `dataflow run` with whatever arguments you passed in! Less clutter wow ✨