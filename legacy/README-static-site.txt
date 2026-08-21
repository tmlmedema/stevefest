STEVE FEST II — WEBSITE
Shannon's Deli · 11 S Park Ave, Lombard, IL 60148 · Sept 11–13, 2026


HOW TO OPEN IT
--------------
Double-click index.html. It opens in any browser — Chrome, Safari, Firefox, Edge.
Nothing to install, no server to run.

Keep index.html and the assets folder together in the same place. If you move
index.html on its own, the logos will disappear.

You need an internet connection the first time you open it, because the fonts
load from Google. Offline it still works, but the type falls back to whatever
the computer has installed.


WHAT'S IN HERE
--------------
index.html                            The whole site — three pages in one file.
assets/wordmark-hero.png              Big STEVE FEST II logo on the home page.
assets/wordmark-nav.png               Small yellow logo in the top bar.
assets/logo-punk-rock-saves-lives.png Supporter logo. (I ♥ DTL is drawn inside
                                      the HTML itself, so it has no file.)


THE THREE PAGES
---------------
HOME      Countdown, the full 46-band bill. Every band name is a link to their
          music. Names in grey have nothing online.
SCHEDULE  Who plays when, by day and stage.
BANDS     One card per act, with a short blurb and where to buy from them.


HOW TO CHANGE THINGS
--------------------
Open index.html in any plain text editor — Notepad, TextEdit, VS Code. Do not
use Word. Scroll to the bottom, past all the styling, and look for the line:

    /* DATA — edit here */

Everything below it is the band list and the running order.

TO FIX A BAND NAME OR BLURB
    Find the band in the BANDS list. Each one looks like this:

    {n:"Dead Freddie", s:"store", base:"Chicago, IL",
     kind:"Power-pop with roots in Chicago's South Side...",
     u:"https://deadfreddie.bandcamp.com/"}

    n    = name shown on the site
    base = where they're from
    kind = the blurb on their card
    u    = their main link (u2 is an optional second link)
    s    = "store" if they sell online, "none" if they don't.
           Cards marked "none" say "Catch them at the merch table."

    Change the text between the quote marks. Leave the quote marks, colons and
    commas exactly where they are — one missing quote mark will blank the page.

TO CHANGE THE SCHEDULE
    Find STAGES and DAYS below the band list. STAGES holds the three stage
    names. Under DAYS, each day has a start time and three lists of band names,
    one per stage, in playing order. Set times are worked out automatically:
    45-minute sets on the hour. Move a name between lists to move that band to
    a different stage.

TO CHANGE THE COUNTDOWN
    Search for DOORS. It's set to Friday Sept 11, 5:00 PM. During the festival
    the countdown swaps to a "happening right now" message, and afterwards to
    "That's a wrap."

AFTER ANY EDIT
    Save the file and refresh the browser. If the page comes up blank, you've
    almost certainly lost a quote mark or a comma — undo your last change.


STILL TO SORT OUT
-----------------
1. Stage names are placeholders: Deli Stage, Alley Stage, Lot Stage. So are
   all the set times. The page says so in pink at the top of the schedule.

2. The poster misspells Alex KASZNEL as "Kesznel." The site uses the correct
   spelling, which is what his Bandcamp says. Worth confirming with him.

3. Five bands couldn't be verified online because other acts share their
   names: The Horrids, The Steves, Bill Nelson, From the Start, and Tiger
   Uppercut. Asking the bands directly for their links would fix all five.

4. Rooftop / acoustic stage is still marked "coming soon."

5. Shannon's Deli is normally closed Sundays. Festival runs Fri–Sun, so it may
   be worth saying something about food on day three.


PUTTING IT ONLINE
-----------------
Drag this whole folder onto netlify.com/drop for a free public link, or hand
it to whoever manages the festival's hosting. It's plain HTML — it will work
anywhere. No build step, no database.
