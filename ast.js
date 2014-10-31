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
        var priv = [].concat( hidden || [] );
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
        return this.astSelect( programAst, function( node ) {
            return !( (node.type === 'ExpressionStatement' && node.expression.value === 'use strict') ||
                     this.isConfExport( node ) );
        }.bind( this ), { depth: 1 } );
    },

    astSelect: function( node, test, opts, depth, selected ) {
        if ( opts.depth ) { opts.minDepth = opts.maxDepth = opts.depth; }

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
        var confExport = this.astSelect( programAst, this.isConfExport, { depth: 1 } )[0]
                .expression.right,

            selectPropByName = function( tree, propName ) {
                return this.astSelect( tree, function( node ) {
                    return node.type === 'Property' && node.key.name === propName;
                }, { depth: 1 } );
            }.bind( this ),

            selectExported = function( propName ) {
                var selected = selectPropByName( confExport, propName );
                return selected.length ? selected[0].value : undefined;
            },
            globalsSubtree = selectExported( 'global' ),
            machineSubtree = selectExported( 'machine' ),
            viewerSubtree = selectExported( 'viewer' ),
            repoSubtree = selectExported( 'repo' ),

            globals;

        // move the globals into the separated subtrees (if there are globals)
        if ( globalsSubtree ) {
            globals = globalsSubtree.properties;

            machineSubtree.properties = globals.concat( machineSubtree.properties );
            viewerSubtree.properties = globals.concat( viewerSubtree.properties );
            if ( repoSubtree ) {
                repoSubtree.properties = globals.concat( repoSubtree.properties );
            }
        }

        return {
            machine: machineSubtree,
            viewer: viewerSubtree,
            repo: repoSubtree
        };
    }
};
