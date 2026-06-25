I want to implement supabase authentication for my application users. With that said, I want you to use the following sources for context before executing this task.

- user journey: @./skeleton/user.journey.md
- db schema: @./skeleton/My_Schema_Example.sql

The user should be able to conduct the following actions:

- a new user should be capabel of registering an accoutn upon registration, and they should be logged in and routed to the home page.

- A returning user should be able to log in and be routed to the home page on success

- A failure to authenticate upon submitting either for registration and/or login in, the user should be advised of the errors and allowed to reattempt login and/or registration

- An authenticated user should only be able to view their own events (unless the View Family events has been toggled, and they have family members added)

- Upon refresh an authenticated user should remain authenticated and be routed to their last visited page.

I want you to generate the actions above where each action represents a phase, verify eac phase using the playwright mcp to walk through the journey as if you were the user and confirm the action was built correctly