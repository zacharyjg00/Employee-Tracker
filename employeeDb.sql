DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

create table employee(
    id int(10) auto_increment primary key,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int(10) not null,
    manager_id int(10)
);

create table role(
    id int(10) auto_increment primary key,
    title varchar(30) not null,
    salary decimal(10) not null,
    department_id int(10) not null
);

create table department(
    id int(10) auto_increment primary key,
    name varchar(30) not null
);

-- Seeding the database
insert into department
    (name)
values
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

insert into role
    (title, salary, department_id)
values
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

insert into employee
    (first_name, last_name, role_id, manager_id)
values
    ('John', 'Doe', 1, null),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, null),
    ('Kevin', 'Tupik', 4, 3),
    ('Kunal', 'Singh', 5, null),
    ('Malia', 'Brown', 6, 5),
    ('Sarah', 'Lourd', 7, null),
    ('Tom', 'Allen', 8, 7);