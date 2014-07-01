module.exports = {
    '_id': '_design/user',
    'language': 'javascript',
    'views': {
        'twitter': {
            'map': function (document) {
                if (document.type === 'user') {
                    emit(document.twitter.id, document);
                }
            }
        }
    }
};
