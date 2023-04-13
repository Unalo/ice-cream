'use strict';

var assert = require('chai').assert;

const pg = require('pg');
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex-coder:pg123@localhost:5432/ice_cream_shop_test';

const pool = new Pool({
    connectionString
});

let iceCreamInstance = require('../ice-cream');
let instanceApp = iceCreamInstance(pool);


describe('Ice cream app', async () => {
    beforeEach(async () => {
        await pool.query('TRUNCATE TABLE ice_cream RESTART IDENTITY CASCADE');
        await pool.query('TRUNCATE TABLE ice_cream_topping RESTART IDENTITY CASCADE');


        // await pool.query('delete from ice_cream_topping');

        // await pool.query('delete from ice_cream');
    });

    it('Should get all the cones', async () => {
        const cones = await instanceApp.getContainer();
        assert.deepEqual(cones,
            [{ name: 'Plain-Cone', price: '11.75' },
            { name: 'Sugar-Cone', price: '17.50' },
            { name: 'Paper-cup', price: '5.00' }]
        );
    });

    it('Should return all the flavours', async () => {
        var flavour = await instanceApp.getFlavour();
        assert.deepEqual(flavour,
            [{ name: 'Vanilla', price: '15.25' },
            { name: 'Chocolate', price: '21.75' },
            { name: 'Strawberry', price: '19.75' }]
        );
    });

    it('Should return all the toppings', async () => {
        let topping = await instanceApp.getTopping();
        assert.deepEqual(topping,
            [{ name: 'Crumbed-peanuts', price: '5.35' },
            { name: 'Caramel-dip', price: '3.75' },
            { name: 'Chocolate-dip', price: '5.35' },
            { name: 'Smarties', price: '7.55' },
            { name: 'Oreos', price: '11.65' },
            { name: 'Astros', price: '13.65' }]
        );
    });

    it('Should return cone id', async () => {
        let coneId = await instanceApp.getContainerId("Sugar-Cone");
        assert.equal(coneId.id, 2);
    });

    it('Should return flavour id', async () => {
        let flavourId = await instanceApp.getFlavourId("Strawberry");
        assert.equal(flavourId.id, 3);
    });

    it('Should return topping id', async () => {
        let toppingId = await instanceApp.getToppingId("Oreos");
        assert.equal(toppingId.id, 5);
    });

    it('Should add ice-cream with cone and flavour', async () => {
        let ice_cream = await instanceApp.iceCream("Paper-cup", "Vanilla");
        let ice = await instanceApp.getIceCream();
        assert.deepEqual(ice, [{ flavour_id: 1, container_id: 3 }]);
    });

    it('Should place oder, then get the order placed ', async () => {
        let ice_cream = await instanceApp.iceCream("Paper-cup", "Vanilla");
        await instanceApp.addTopping(ice_cream, ["Crumbed-peanuts", "Smarties", "Astros"]);
        let order = await instanceApp.getTotals();
        // console.log(...order);
        assert.deepEqual(...order,
            {
                id: 1,
                container: 'Paper-cup',
                container_cost: '5.00',
                flavour: 'Vanilla',
                flavour_cost: '15.25',
                toppings:
                    [{ name: 'Crumbed-peanuts', price: '5.35' },
                    { name: 'Smarties', price: '7.55' },
                    { name: 'Astros', price: '13.65' }],
                total: 46.8
            }
        );
    });

    it('Should get the selected cone, flavour and topping', async () => {
        let ice_cream = await instanceApp.iceCream("Paper-cup", "Vanilla");
        await instanceApp.addTopping(ice_cream, ["Crumbed-peanuts", "Smarties", "Astros"]);
        let order = await instanceApp.getTotals();
        let selectedCone = await instanceApp.getSelectedCone(1);
        let selectedFlavour = await instanceApp.getSelectedFlavour(1);
        let selectedTopping = await instanceApp.getSelectedTopping(1);
        // console.log(selected);
        assert.deepEqual(selectedCone,
            [{ name: 'Plain-Cone', price: '11.75' },
            { name: 'Sugar-Cone', price: '17.50' },
            { name: 'Paper-cup', price: '5.00', checked: 'checked' }]
        );

        assert.deepEqual(selectedFlavour,
            [{ name: 'Vanilla', price: '15.25', checked: 'checked' },
            { name: 'Chocolate', price: '21.75' },
            { name: 'Strawberry', price: '19.75' }]

        );

        assert.deepEqual(selectedTopping,
            [ { name: 'Crumbed-peanuts', price: '5.35', checked: 'checked' },
            { name: 'Caramel-dip', price: '3.75' },
            { name: 'Chocolate-dip', price: '5.35' },
            { name: 'Smarties', price: '7.55', checked: 'checked' },
            { name: 'Oreos', price: '11.65' },
            { name: 'Astros', price: '13.65', checked: 'checked' } ]
        );
    });

});
after(async () => {
    await pool.end();
});