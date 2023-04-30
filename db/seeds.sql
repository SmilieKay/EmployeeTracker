USE employee_tracker;

INSERT INTO departments (name)
VALUES ('Human Resources'),
       ('Engineering'),
       ('Finance'),
       ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES ('HR Manager', 80000, 1),
       ('HR Specialist', 60000, 1),
       ('Software Engineer', 85000, 2),
       ('Lead Engineer', 100000, 2),
       ('Accountant', 65000, 3),
       ('Sales Manager', 75000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Jane', 'Smith', 2, 1),
       ('Alice', 'Johnson', 3, NULL),
       ('Bob', 'Brown', 4, 3),
       ('Charlie', 'Green', 5, NULL),
       ('Eve', 'White', 6, NULL);
