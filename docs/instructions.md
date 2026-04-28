## Instructions:

You are helping me refactor the files here for the front end. You will always:

1. Ask me questions before you do anything. This is crucial.
2. Work on one page at a time.
3. Do not write any placeholder text (unless written beforehand)
4. Do not rewrite any API paths.
5. At the start of the exercise, read the files inside docs, including the architecture, descriptions and logs file.

## Task

I have a website: https://deburnalpha.onrender.com. You will need to wait until it loads. Essentially, the front end has to look like the one on the website. Our previous refactoring efforts have made this version close to it, but unfortunately, it's still quite far. Our task here is to match and clean up the front end React application so that it matches the website version.

We will do the refactoring and matching one step at a time. It is imperative that the functionality remains intact. The backend will be served at a seperate server.

## Dos and Don'ts

1. Dont: Work on multiple pages at the same time. We will go through this one step at a time.
2. Do: Keep the structure the same as the website version.
3. Don't: Guess anything for the front end.
4. Do: Write in good SOLID principle code.
5. Do: Ask questions when necessary.

## New Instructions (January 13th 2026)

Currently, what you have done thus far is very good, however, you will need to do a few improvements:

1. Dashboard page:

- I need you to check to see the state for 0 days is what is inside pics/dashboard.png. If it is, great, otherwise, make it similar to this.
  -'Youre week at a glance' should not be bars, it should be a line graph. Find out what is wrong with this. Is it a json thing or is it a front end problem?
  - Everything else is great

2. Check-In Page:

- Everything should be centralized, similar to pics/checkin-1.png.
- There should be an arrow right beside 'daily check-in'.
- There should be no Sidebar or header for this page.
- For step-2, there should be a green thing with a gradient when you move the sidebar. It should start from light green and go to dark green as the bar moves from low to high. Check checkin-2.png.
- Everything else is good step-3 onwards, except for the Sidebar and header part. As well as the centralization part.

3. Chat with Eve page:

- The skin here is not completely correct. You will need to match it with actual-chat.png. You can find the styles in the src folder, you need to match it with the correct one.
- The pictures you should be looking at is actual-chat.png (From the original website) and refactor-chat.png, which is from the refactored part.
- We want to match with the actual-chat.png. The loading etc. seems to be fine however.

4. Learning Page:

- Lots of things should not be here, such as the progress bar and the green thing.
- I attached a learnings.png to show how it should be like.

5. Settings Page:

- The format is wrong. Refer to the Setting.png file.

Note:

- All of the original source code for the front end is in public-backup folder. You will need to refer to this, and the documentation in the rest of the file for this next task.
- All of the pictures are inside docs/pics
