'use strict';

var createPushNewFile = require('./createPushNewFile'),
    collabMerge = require('./collabMerge'),
    silentBadMerge = require('./silentBadMerge');

// TODO: make this automatic
module.exports = {
    createPushNewFile: createPushNewFile,
    collabMerge: collabMerge,
    silentBadMerge: silentBadMerge
};
