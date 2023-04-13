drop table if exists topping, flavour, container, ice_cream, ice_cream_topping cascade;

create table topping(
	id serial not null primary key,
	name text not null,
	price decimal(10,2)
);

create table flavour(
	id serial not null primary key,
	name text not null,
	price decimal(10,2)
);
create table container(
	id serial not null primary key,
	name text not null,
	price decimal(10,2)
);

create table  ice_cream(
	id serial not null primary key,
	flavour_id int,
	container_id int,
	foreign key (flavour_id) references flavour(id),
	foreign key (container_id) references container(id)

);

create table ice_cream_topping(
	id serial not null primary key,
	topping_id int,
	ice_cream_id int,
	foreign key (topping_id) references topping(id),
	foreign key (ice_cream_id) references ice_cream(id)
);



-- create table categories(
-- 	id serial not null primary key,
-- 	description text not null
-- );

-- create table products (
-- 	id serial not null primary key,
--     description text not null,
-- 	price decimal(10,2),
-- 	category_id int,
-- 	foreign key (category_id) references categories(id)
-- );