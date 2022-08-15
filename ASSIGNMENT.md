# Team Structure as a Service

## Task

You need to create an HTTP backend for managing a team structure. The structure is a tree with only one manager at the top. Each member should have an email and name. The email is unique. You have to implement the following operations:

1. Add a new member (email, name, optional manager)
2. Change the manager of a member
3. Remove a member, all members that report to him are transferred to his manager
4. Combination of 2 + 3
5. Import the team structure from JSON format
6. Export the team structure to JSON format
7. Get members by filters like part of user name, part of email, manager email, direct employee email
8. Rebalance teams, we need to lower the hierarchy in the tree following these rules:
   - a. No manager can have more than X people that report to him
   - b. If a manager has more than X reports, move the extra members one level below under the management of a member of his current team
   - c. If a manager has less than X people reporting to him, move people from 2 levels below 1 level up
   - d. Members don’t like moving too much in the hierarchy, they prefer to move 1 level up/down instead of making a jump of 2 levels
   - e. Try to fill existing teams before adding members to a fresh manager

## Requirements

- Technologies: node.js, typescript
- Persistence: in-memory, the initial team structure could be loaded from a file
- Git repo with instructions on how to start the service
- Ability to load sample data into the service
- Tests
- Restful

## Bonus

- Ability to easily visualize the current team structure (could be just a formatted string or a more complicated UI)
- Implement authentication
