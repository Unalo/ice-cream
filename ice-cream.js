module.exports = (pool) => {

    const getContainer = async () => {
        const cones = await pool.query(`select name, price from container`);
        return cones.rows;
    }

    const getFlavour = async () => {
        const flavour = await pool.query(`select name, price from flavour`);
        return flavour.rows;
    }

    const getTopping = async () => {
        const toppings = await pool.query(`select name, price from topping`);
        return toppings.rows;
    }

    const getContainerId = async (cone) => {
        const getConeId = await pool.query(`select id from container where name = $1`, [cone]);
        return getConeId.rows[0];
    }

    const getFlavourId = async (flavour) => {
        const getFlavourId = await pool.query(`select id from flavour where name = $1`, [flavour]);
        return getFlavourId.rows[0];
    }

    const iceCream = async (cone, flavour) => {
        let coneId = await getContainerId(cone)
        let flavourId = await getFlavourId(flavour);
        const ice = await pool.query(`insert into ice_cream (flavour_id, container_id) values ($1, $2) returning id`, [flavourId.id, coneId.id])
        return ice.rows[0].id;
    }

    const getToppingId = async (topping) => {
        const toppingId = await pool.query(`select id from topping where name = $1`, [topping]);
        return toppingId.rows[0];
    }

    const getIceCreamId = async (iceCreamId) => {
        const iceId = await pool.query(
            `select ice_cream.id, ice_cream.flavour from ice_cream 
        join flavour on flavour.id = ice_cream.flavour_id 
        join container on container.id = ice_cream.container_id where id = $1`, [iceCreamId])
        return iceId
    }

    const addTopping = async (iceCreamId, topping) => {
        let toppings = Array.isArray(topping) ? topping : [topping];
        for (const toppingId of toppings) {
            let id = await getToppingId(toppingId);
            await pool.query(`insert into ice_cream_topping (topping_id, ice_cream_id) values ($1, $2)`, [id.id, iceCreamId]);
        }
    }

    const getOrder = async () => {
        const coneData = await getContainerData();
        const flavourData = await getFlavourData()
        const toppingData = await getToppingData()
        let order = [{ coneData, flavourData, toppingData }]
        return order;
    }

    const getIceCream = async () => {
        const iceCream = await pool.query(`select flavour_id, container_id from ice_cream`)
        return iceCream.rows;
    }

    const getContainerData = async () => {
        const container = await pool.query(`select name,price from ice_cream   
        join container on container.id = ice_cream.container_id `)
        return container.rows;
    }

    const getGrandTotal = async () => {
        let grand = 0
        let total = await getTotals()
        const data = total.map(async element => {
            grand += Number(element.total);
            return grand
        })
        let grandTotal = data;

    }

    const getTotals = async () => {
        let dataSet = await getContainerAndFlavour();

        const tot = dataSet.map(async data => {
            const adds = Number(data.container_cost) + Number(data.flavour_cost)
            const toppings = await getToppingData(data.id);
            let total = 0;
            toppings.forEach(element => {
                total += Number(element.price);
            });
            total = total + Number(adds);
            return {
                ...data,
                total
            };
        });
        const TotalData = await Promise.all(tot);
        return TotalData
    }

    const getContainerAndFlavour = async () => {
        let total = 0;
        const data = await pool.query(`select ice_cream.id as id, 
        container.name as container, 
        container.price as container_cost, 
        flavour.name as flavour, 
        flavour.price as flavour_cost  
        from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id`)
        const iceCream = data.rows.map(async item => {
            const toppings = await getToppingData(item.id);
            return {
                ...item,
                toppings
            }
        });
        const myIceCreams = await Promise.all(iceCream);
        return myIceCreams
    }

    const getFlavourData = async () => {
        const flavour = await pool.query(`select name,price from ice_cream   
        join flavour on flavour.id = ice_cream.flavour_id`)
        return flavour.rows;
    }

    const getToppingData = async (iceCreamId) => {
        const toppings = await pool.query(`select name,price from ice_cream_topping   
        join topping on topping.id = ice_cream_topping.topping_id where ice_cream_id = $1`, [iceCreamId])
        return toppings.rows;
    }

    const getCardLenght = async () => {
        const cart = await pool.query(`select * from ice_cream`);
        return cart.rowCount;
    }
    const clearAll = async () => {
        try {
            await pool.query('delete from ice_cream_topping');
            let data = await pool.query('delete from ice_cream');
            return data
        } catch (error) {
            console.log(error);
        }
    }
    const getSelectedCone = async (iceId) => {
        const cone = await getContainer();
        const conFalv = await pool.query(`select ice_cream.id as id, 
        container.name as container, 
        container.price as container_cost, 
        flavour.name as flavour, 
        flavour.price as flavour_cost  
        from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id where ice_cream.id =$1`, [iceId]);

        for (const con of cone) {
            for (const data of conFalv.rows) {
                if (data.container === con.name) {
                    con.checked = 'checked';
                }
            }
        }
        return cone;
    }

    const getSelectedFlavour = async (iceId) => {
        const flav = await getFlavour();
        const conFalv = await pool.query(`select ice_cream.id as id, 
        container.name as container, 
        container.price as container_cost, 
        flavour.name as flavour, 
        flavour.price as flavour_cost  
        from ice_cream   
        join container on container.id = ice_cream.container_id
        join flavour on flavour.id = ice_cream.flavour_id where ice_cream.id =$1`, [iceId]);

        for (const flavour of flav) {
            for (const data of conFalv.rows) {
                if (data.flavour === flavour.name) {
                    flavour.checked = 'checked';
                }
            }
        }
        return flav;
    }

    const getSelectedTopping = async (id) => {
        const topping = await getToppingData(id);
        let topp = await getTopping();
        for (const toppings of topp) {
            for (const data of topping) {
                if (data.name === toppings.name) {
                    toppings.checked = 'checked';
                }
            }
        }
        return topp
    }

    const upDate = async (id) => {
        await pool.query(`delete from ice_cream_topping where ice_cream_id = $1`, [id]);
        await pool.query(`delete from ice_cream where id = $1`, [id]);
    }
    return {
        getContainer,
        getFlavour,
        getTopping,
        getContainerId,
        getFlavourId,
        iceCream,
        getToppingId,
        getIceCreamId,
        getOrder,
        getIceCream,
        addTopping,
        getCardLenght,
        clearAll,
        getContainerAndFlavour,
        getTotals,
        getGrandTotal,
        getSelectedCone,
        getSelectedFlavour,
        getSelectedTopping,
        upDate
    }
}