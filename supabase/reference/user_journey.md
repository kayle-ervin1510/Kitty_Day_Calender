User should visit my application and be immediately faced with a form that will handle BOTH registration and login. This form should be exchangeable pending on whether the user indicates if they have an account already, or not.

If a user is registering they should confirm their email and their password prior to successful registration.

After filling out the form they will either register and/or login and be sent to the home page where they will see a few paragraphs describing the purpose and intent of the application. 

Users may visti a page named "My Profile" that includes the users's information (username, password, email, phone number, name, prefered name), a tab called My Events where all their events are listed, and a tab called My Calender.

    - if a user selects My Calender, they are taken to the Calender page, where they are greeted with an image of a cat (the cat image specified for that particular day), and a welcome message. There should be toggles to view the calender in monthly format, daily format, or weekly format. There should be a toggle to view Federal Holidays, a toggle to view Family Events, and a toggle to view International HOlidays. There should also be a button that says: "Add Event". There will also be a button that says: "Get your Cat Fact!" that can be used once a day. If users click on the button multiple times a day, they will see the same cat fact, until midnight occurs, then it will reset and give the user a new Cat Fact.

    - After clicking "Add Event" users are taken to another page, where they can name the event, select the date it will occur on, and a time range. They can select to be notified of the event one week prior, one day prior, one hour prior, 30 minutes prior, or 15 minutes prior. Users also have the option of making the event viewable to all family (if the account is for a family), or marking it as a holiday, birthday, or other.
    
Once the date and/or time of the event passes by, the calender marks off the day (and event) from the calender. It is still viewable by the user (unless they delete it) but no longer of importance.

When viewing the calender, users can see their events listed, and edit it by hovering over the event (or clicking on it if they're on a phone) and pressing the button "Edit Event". They will also be given the option "Delete Event". 

For deleting an event, confirmation will be required of the user (a message saying: "Do you really want to delete me?" will appear). IF users do want to delete the item, they click on the "Yes, delete", after which a message should pop up saying: "You event has been shredded - Meow meow". Users can exit out of the message, and their deleted event will no longer be available for viewing.

Users can visit an About Us page that declares why Kitty Day Calender was created, and what it is supposed to be used for. There should hypertext below the message that says: "Contact Us"

Upon clickign "Contact Us", users should be taken to another page that includes the App's support team via email, phone, github, and/or linked in. They will also have the option of reviewing the application on Google Play. 

If something goes wrong, the page should state: "Oops, something went wrong. Stand by while our kITties try to figure out what's up." complete with a cat picture that coincides with the HTTPS code error (if there is no HTTPS code error, then a different cat picture can be used).

Users can view their current, past, and future events in their My Events page accessable from their profile. 

User logs out.

This React + Vite appliation using React Router DOM is functioning correctly and I want to preserve the existing US and user experiences. 

Resources: 
1. SQL Schema: @./Client/skeleton/My_Schema_Example.sql
2. Supabase Project URL: https://ntazfxyuwzqoavsfvdmm.supabase.co/rest/v1/
3. Supabase Public API Key: sb_publishable_kNnesLdkzvgCEDi35w2O9g_r3wY9Wec
4. Resources: Users and Events.
5. Applications user journey: @./Client/skeleton/user_journey.md

Requirements:

* Analyze the current application before making any code changes.
* Identify all exisiting CRUD flows and components that manage data.
* PResent and implementation plan before modifying code.

Implementation Requirements:

* PReserve the existing UI.
* Replace all mock/local CRUD operations with Supabase API interactions.
* Use axios for all API communications.
* Create a dedicated API service layer
* Components should never directly call axios
* Store API configuration in environment variables.
* Implement loading, error, and success states for all CRUD actions.
* Ensure all UI changes remain synchronized with the Supabase backend.
* Analyze the SQL schema and correctly implement any realtionships between tasks and users
* Do not implement authentication at this time
* Do not introduce unnecessary architectural changes or redesign existing components.

Deliverables:

1. Analysis of current architecture
2. Proposed implemtnation plan
3. Code changes
4. Summary of modifed files
5. Any assumptions made during implementation

Before writng code, tell me if you identify any ambiguities, missing schema information or acrhitecutural concerns.
