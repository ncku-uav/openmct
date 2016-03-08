/*****************************************************************************
 * Open MCT Web, Copyright (c) 2009-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,describe,it,expect,beforeEach,waitsFor,jasmine,window,afterEach*/

define([
    "../../src/actions/TimelineTraverser"
], function (TimelineTraverser) {
    'use strict';

    describe("TimelineTraverser", function () {
        var testModels,
            mockDomainObjects,
            traverser;

        function addMockDomainObject(id) {
            var mockDomainObject = jasmine.createSpyObj(
                    'domainObject-' + id,
                    [
                        'getId',
                        'getCapability',
                        'useCapability',
                        'hasCapability',
                        'getModel'
                    ]
                ),
                model = testModels[id];

            mockDomainObject.getId.andReturn(id);
            mockDomainObject.getModel.andReturn(model);

            mockDomainObject.hasCapability.andCallFake(function (c) {
                return c === 'composition' ? !!model.composition :
                    c === 'relationship' ? !!model.relationships :
                        false;
            });

            mockDomainObjects[id] = mockDomainObject;
        }

        beforeEach(function () {
            testModels = {
                a: { composition: [ 'b', 'c' ]},
                b: { composition: [ 'c' ] },
                c: { relationships: { modes: [ 'd' ] } },
                d: {},
                unreachable: {}
            };

            mockDomainObjects = {};
            Object.keys(testModels).forEach(addMockDomainObject);


            traverser = new TimelineTraverser(mockDomainObjects.a);
        });

        describe("buildObjectList", function () {
            var objects;

            function contains(id) {
                return objects.indexOf(mockDomainObjects[id]) !== -1;
            }

            beforeEach(function () {
                traverser.buildObjectList().then(function (objectList) {
                    objects = objectList;
                });
            });

            it("includes the object originally passed in", function () {
                expect(contains('a')).toBe(true);
            });

            it("includes objects reachable via composition", function () {
                expect(contains('b')).toBe(true);
                expect(contains('c')).toBe(true);
            });

            it("includes objects reachable via relationships", function () {
                expect(contains('d')).toBe(true);
            });

            it("does not include unreachable objects", function () {
                expect(contains('unreachable')).toBe(false);
            });
        });

    });
});