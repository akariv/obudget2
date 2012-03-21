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

Open in a browser:

    src/app/index.html

Build
===

Run the make file


Develop
===

The site is built as client side only, fetching JSON data from the [hasadna-data web](https://github.com/akariv/hasadna-data) service.
The javascript development is done with [coffeescript](http://coffeescript.org).
The source files are located in the follwoing directory:

    src/coffee

The html and css files are located here:

    src/target
