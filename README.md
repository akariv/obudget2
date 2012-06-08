Open Budget 2.0 התקציב הפתוח
===

The Open Budget 2.0 is in Early development stages. The roadmap for development is as followed:

- Overhaul design of the website
- Design and add Navigator at the top part of the page
- Design and add a search box (simple one dimensional results)
- Design complex search results display
- Add authentication for user registration (Requires server)
- Allow users to comment and converse over the site's web-pages

Features and bugs waiting for volunteers to develop are listed [here](https://track.nsa.co.il/projects/open-budget-2)

Run
===

- Install [node.js](http://nodejs.org/)
- Run the following command from the project root. This will install all external packages needed


        npm install

- Run the application server:


        node app.js

- Open your browser with the following address:


        localhost:3000


Build
===
Make sure you have [CoffeeScript](http://coffeescript.org/) installed. To install, run the following command from the command line (Windows, Mac, Linux):

    npm install -g coffee-script

Note: you must have node.js installed as well

after installing coffeescript, compiling the project with 'cake'. It comes with coffeescript:

    cake build

Develop
===

The site is built as client side only, fetching JSON data from the [hasadna-data web](https://github.com/akariv/hasadna-data) service.
The javascript development is done with [coffeescript](http://coffeescript.org).
The source files are located in the follwoing directory:

    src/coffee

The html and css files are located here:

    src/app

---

A list of needed tasks to be done and bugs to be fixed is [here](https://track.nsa.co.il/projects/open-budget-2/issues).
Please [create a user](https://track.nsa.co.il/account/register) and email gardenofwine (at) gmail (dot) com to get added to the project as a developer.

How to contribute code?
===
**Making a branch for your changes**

When adding features or bug fixes, please create a separate branch for each changeset you want us to pull in. Use the issue number in the branch name, or a description of the feature. To create the branch, do something like this:

	git branch   (lists your current branches)
	git branch my_new_code   (makes a new branch called my_new_code)
	git checkout my_new_code

**Push your code and make a pull request**

When you have finished making your changes, you'll need to push up your changes to your fork so we can grab them. With them all committed, push them:

	git push origin my_new_code

This pushes everything in that branch up. Then you can go back over to the main github page and issue a pull request from there.  Tell us what you want us to merge and what it does/fixes, and one of us will pick it up.

That lets us know that there's something new from you that needs to be pulled in. We'll review it and get back to you about it if we have any questions. Otherwise, we'll integrate it and let you know when it's in!
