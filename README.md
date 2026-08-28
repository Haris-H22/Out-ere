# Out-ere

Out-ere is a student activities and events discovery and booking platform designed to help university students discover activities happening across universities and cities in the UK.

The platform brings student activities into one place, allowing students to discover events, view activity details, save activities, make bookings and receive personalised recommendations.

Out-ere also provides a dedicated organiser experience for organisations, societies and event organisers to manage activities associated with their organisation.

> **Status:** MVP / Currently in development

---

## Overview

University students often have to search across university websites, students' union platforms, society pages and social media to find activities and events.

Out-ere aims to simplify this experience by providing a centralised platform for discovering student activities.

Students can browse activities, explore events from different universities and cities, save activities they are interested in, make bookings and receive personalised recommendations based on their interests and behaviour.

Organisers have a separate organiser experience where they can manage activities associated with their organisation.

---

## Key Features

### Student Features

- Student account registration
- Secure authentication
- Student login and logout
- Activity discovery
- Activity search
- Activity filtering
- Activity categories
- University-based activity discovery
- Activity detail pages
- Event dates and times
- Event locations
- Event pricing
- Event capacity information
- Save activities
- Remove saved activities
- Book activities
- View confirmed bookings
- User profile
- University preferences
- Interest preferences
- Personalised activity recommendations
- Responsive design
- Mobile navigation

---

### Organiser Features

Out-ere provides a separate organiser experience for organisations that manage their own events.

Organisers can:

- Access an organiser-only dashboard
- View activities belonging to their organisation
- Manage organiser activities
- View activity information
- Access organiser-specific navigation
- Maintain a separate organiser experience from student accounts

Organisers do not have access to student-only functionality such as saved activities and bookings.

---

## Personalised Recommendations

Out-ere includes a separate Python-based recommendation service designed to provide personalised activity recommendations.

The recommendation system can use information including:

- Previous activity interactions
- Activity categories
- User interests
- University preferences
- Activity popularity
- Upcoming activities
- Confirmed bookings

The recommendation engine ranks available activities and returns personalised recommendations.

Recommendations can also include an explanation describing why an activity was recommended.

### Recommendation Flow

```text
User Activity
      |
      +----------------------+
      |                      |
      v                      v
Interactions          User Preferences
      |                      |
      +----------+-----------+
                 |
                 v
        Recommendation Engine
                 |
        +--------+--------+
        |        |        |
        v        v        v
     Interests Popularity University
                 |
                 v
          Ranked Activities
                 |
                 v
       Personalised Results