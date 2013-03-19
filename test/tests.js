describe('radioactive decay', function () {

    var radioactiveDecay = require('radioactive-decay'),
        isotopeData      = require('reinpk-isotope-data'),
        _                = require('component-underscore');

    // Decay Chains
    // ------------

    describe('decay chains', function () {

        var searchDecayTree = function (isotope, searchIsotope, searchDecayTree) {
            var products = radioactiveDecay.products(isotope);
            if (products) {
                for (var i = 0; i < products.length; i++) {
                    if (products[i].product === searchIsotope)
                        return searchIsotope;
                    else
                        return searchDecayTree(products[i].product, searchIsotope, searchDecayTree);
                }
            }
        };

        it('has a complete thorium series from Cf-252 to Pb-208', function () {
            var Pb208 = searchDecayTree('Cf-252', 'Pb-208', searchDecayTree);
            expect(Pb208).to.equal('Pb-208');
        });
        it('has a complete actinium series from Pu-239 to Pb-207', function () {
            var Pb207 = searchDecayTree('Pu-239', 'Pb-207', searchDecayTree);
            expect(Pb207).to.equal('Pb-207');
        });
        it('has a complete radium series from Pu-242 to Pb-206', function () {
            var Pb206 = searchDecayTree('Pu-242', 'Pb-206', searchDecayTree);
            expect(Pb206).to.equal('Pb-206');
        });
        it('has a complete neptunium series from Cf-249 to Tl-205', function () {
            var Tl205 = searchDecayTree('Cf-249', 'Tl-205', searchDecayTree);
            expect(Tl205).to.equal('Tl-205');
        });

        it('has a complete fission product light series from Y-99 to Ru-99', function () {
            var Ru99 = searchDecayTree('Y-99', 'Ru-99', searchDecayTree);
            expect(Ru99).to.equal('Ru-99');
        });
        it('has a complete fission product heavy series from Te-135 to Ba-135', function () {
            var Ba135 = searchDecayTree('Te-135', 'Ba-135', searchDecayTree);
            expect(Ba135).to.equal('Ba-135');
        });

    });



    // Decay Profile
    // -------------

    describe('decay profile', function () {

        it('has simple exponential decay for each single isotope', function () {

            _.each(_.keys(isotopeData), function (isotopeName) {

                var charge = {};
                charge[isotopeName] = 1;

                var mass = radioactiveDecay.mass(charge);

                var halflife = isotopeData[isotopeName].halflife;
                for (var halflives = 0; halflives < 5; halflives++) {
                    var remaining = mass(halflife*halflives)[isotopeName];
                    var remainingExpected = Math.pow(0.5, halflives);

                    var error = Math.abs( (remaining - remainingExpected) / remainingExpected );
                    expect(error).to.be.lessThan(0.0000001);
                }

            });
        });

        it('has expected decay rate with child isotope in chain', function () {

            // Th-231 (25 hour halflife) decays to Pa-231 (32k year halflife)
            // So we expect the conversion to Pa-231 to be pretty complete after 1 year
            // but pretty much all the Pa-231 should still be around

            // start with 1000 kg of Thorium-231
            var startingMass = 1000;
            var mass = radioactiveDecay.mass({
                'Th-231' : startingMass
            });

            // one year later...
            var remainingThorium = mass(1)['Th-231'];
            expect(remainingThorium).to.be.lessThan(0.00000000001);

            var freshProtactinium = mass(1)['Pa-231'];
            var expectedProtactinium = startingMass / isotopeData['Th-231'].molarMass * isotopeData['Pa-231'].molarMass;

            var error = Math.abs( (freshProtactinium - expectedProtactinium) / expectedProtactinium );
            expect(error).to.be.lessThan(0.0001);

        });
    });

});



