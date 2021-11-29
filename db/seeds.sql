USE employee_db;

INSERT INTO department 
    (id, name) VALUES 
    (1, "Management"), 
    (2, "Engineering"), 
    (3, "Finance"), 
    (4, "Legal"), 
    (5, "Sales"),
    (6, "Information Technology"),
    (7, "Administration");


INSERT INTO role 
    (id, title, salary, department_id) VALUES 

    (1, "Chief Executive Officer", 300000, 1),
    (2, "Chief Finance Offier", 250000, 1),
    (3, "Account Manager", 150000, 2),
    (4, "Computer Engineer", 100000, 2),
    (5, "Accountant", 65000, 3),
    (6, "Auditor", 90000, 3),
    (7, "Legal Team Lead", 120000, 4),
    (8, "Lawyer", 80000, 4),
    (9, "Sales Lead", 100000, 5),
    (10, "Salesperson", 75000, 5),
    (11, "Full Stack Developer", 125000, 6),
    (12, "UI/UX Developer", 115000, 6),
    (13, "Receptionist", 50000, 7),
    (14, "Cleaner", 45000, 7);

INSERT INTO employee 
    (id, first_name, last_name, role_id, manager_id) VALUES
    (1, "Alisha", "Shakya", 1, null),
    (2, "Ersa", "Bajracharya", 2, 1),
    (3, "Roshan", "Bajracharya", 3, 1),
    (4, "Rubin", "Bajracharya", 4, 3),
    (5, "Bijay", "Benjankar", 5, 2),
    (6, "Rajish", "Shrestha", 6, 2),
    (7, "Avash", "Pradhan", 7, 2),
    (8, "Rastra Bimochan", "Timalsena", 8, 7),
    (9, "Sumedh", "Shakya", 9, 1),
    (10, "Sanjal", "Byanjankar", 10, 9),
    (11, "Gorakh", "Shrestha", 11, 3),
    (12, "Rusum", "Khoju", 12, 3),
    (13, "Ruby", "Rana", 13, 2),
    (14, "Oliver", "Smit", 14, 13);