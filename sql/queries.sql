        select ice_cream.id from ice_cream 
        join flavour on flavour.id = ice_cream.flavour_id 
        join container on container.id = ice_cream.container_id;


        select ice_cream_id, topping_id, flavour_id, container_id, name topping_name, price as topping_price  
        from ice_cream_topping 
        join topping on topping.id= ice_cream_topping.topping_id 
        join ice_cream on ice_cream_id = ice_cream_topping.ice_cream_id

        select container.name as container, container.price as container_cost, flavour.name as flavour, flavour.price as flavour_cost  from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id where id = ;


select name,price from ice_cream   
        join flavour on flavour.id = ice_cream.flavour_id




        select ice_cream.id as id, container.name as container, 
        container.price as container_cost, 
        flavour.name as flavour, 
        flavour.price as flavour_cost  
        from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id where id = 

       select  
        container.name as container, 
        flavour.name as flavour, 
        from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id


        delete from ice_cream_topping where ice_cream_id = $1;
        delete from ice_cream where id = $1