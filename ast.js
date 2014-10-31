'use strict';

module.exports = {
    createReturn: function( argument ) {
        return { type: 'ReturnStatement', argument: argument };
    },

    createBlockStatement: function( body ) {
        return {
            type: 'BlockStatement',
            body: [].concat( body )
        };
    },

    createFunction: function( body ) {
        // a simple nullary function to scope the conf modules
        return {
            type: 'FunctionExpression',
            id: null,
            params: [],
            defaults: [],
            body: body,
            rest: null,
            generator: false,
            expression: false
        };
    },

    createProperty: function( key, value ) {
        return {
            type: 'Property',
            key: { type: 'Identifier', name: key },
            value: value,
            kind: 'init'
        };
    },

    createObject: function( properties ) {
        return { type: 'ObjectExpression', properties: properties };
    },


    createSubmodule: function( hidden, returned ) {
        var priv = [].concat( hidden );
        return this.createFunction(
            this.createBlockStatement( priv.concat( this.createReturn( returned ) ) ) );
    },

    createModule: function( encapsulated, exports ) {
        var usestrict = {
            type: 'ExpressionStatement',
            expression: { type: 'Literal', value: 'use strict', raw: '\'use strict\'' }
        },
        moduleExports = {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: {
                    type: 'MemberExpression',
                    computed: false,
                    object: { type: 'Identifier', name: 'module' },
                    property: { type: 'Identifier', name: 'exports' }
                },
                right: exports
            }
        };

        encapsulated = encapsulated || [];

        return {
            type: 'Program',
            body: [ usestrict ].concat( encapsulated, moduleExports )
        };
    },

    isConfExport: function( node ) {
        return node.type === 'ExpressionStatement' &&
            node.expression.type === 'AssignmentExpression' &&
            node.expression.left.property.name === 'exports';
    },

    getCombinedScopeExprs: function( programAst ) {
        var self = this;
        return self.astSelect( programAst, function( node ) {
            // console.log( node );
            return !( (node.type === 'ExpressionStatement' && node.expression.value === 'use strict') ||
                     self.isConfExport( node ) );
        }, { minDepth: 1, maxDepth: 1 } );
    },

    astSelect: function( node, test, opts, depth, selected ) {
        depth = depth || 0;
        selected = selected || [];

        var self = this;

        if ( ( !opts.minDepth || depth >= opts.minDepth ) && test( node ) ) {
            selected.push( node );
        }

        if ( !opts.maxDepth || ( opts.maxDepth && depth < opts.maxDepth ) ) {
            Object.keys( node ).forEach( function( key ) {
                var val = node[ key ];
                if ( Array.isArray( val ) ) {
                    val.forEach( function( child ) {
                        self.astSelect.call( self, child, test, opts, depth + 1, selected );
                    });
                }
            });
        }

        return selected;
    },

    getConfSubtrees: function( programAst ) {
        var self = this,
            confExport = self.astSelect( programAst, this.isConfExport,
                                   { minDepth: 1, maxDepth: 1 } )[0].expression.right,
            selectPropValue = function( tree, propName ) {
                return self.astSelect( tree, function( node ) {
                    return node.type === 'Property' && node.key.name === propName;
                }, { minDepth: 1, maxDepth: 1 } )[0].value;
            },
            globalsSubtree = selectPropValue( confExport, 'global' ),
            machineSubtree = selectPropValue( confExport, 'machine' ),
            viewerSubtree = selectPropValue( confExport, 'viewer' ),
            globals = globalsSubtree.properties;

        // move the globals into the separated subtrees
        machineSubtree.properties = globals.concat( machineSubtree.properties );
        viewerSubtree.properties = globals.concat( viewerSubtree.properties );

        return {
            machine: machineSubtree,
            viewer: viewerSubtree
        };
    }
};
