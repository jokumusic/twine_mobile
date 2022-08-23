"use strict";
exports.__esModule = true;
exports.IDL = void 0;
exports.IDL = {
    "version": "0.1.0",
    "name": "twine",
    "instructions": [
        {
            "name": "createStore",
            "accounts": [
                {
                    "name": "store",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "storeId",
                    "type": "string"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                }
            ]
        },
        {
            "name": "updateStore",
            "accounts": [
                {
                    "name": "store",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                }
            ]
        },
        {
            "name": "createProduct",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "product",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "productMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintProductRef",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "twineProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "productId",
                    "type": "string"
                },
                {
                    "name": "decimals",
                    "type": "u8"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                },
                {
                    "name": "cost",
                    "type": "u64"
                },
                {
                    "name": "sku",
                    "type": "string"
                }
            ]
        },
        {
            "name": "createStoreProduct",
            "accounts": [
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "product",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "productMint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintProductRef",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "store",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "twineProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "productId",
                    "type": "string"
                },
                {
                    "name": "decimals",
                    "type": "u8"
                },
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                },
                {
                    "name": "cost",
                    "type": "u64"
                },
                {
                    "name": "sku",
                    "type": "string"
                }
            ]
        },
        {
            "name": "updateProduct",
            "accounts": [
                {
                    "name": "product",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                },
                {
                    "name": "cost",
                    "type": "u64"
                },
                {
                    "name": "sku",
                    "type": "string"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "store",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "storeId",
                        "type": "string"
                    },
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "productCount",
                        "type": "u64"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "type": "string"
                    }
                ]
            }
        },
        {
            "name": "product",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "productId",
                        "type": "string"
                    },
                    {
                        "name": "owner",
                        "type": "publicKey"
                    },
                    {
                        "name": "store",
                        "type": {
                            "option": "publicKey"
                        }
                    },
                    {
                        "name": "cost",
                        "type": "u64"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "name": "sku",
                        "type": "string"
                    }
                ]
            }
        },
        {
            "name": "mintProductRef",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": "u8"
                    },
                    {
                        "name": "product",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "ProductCategory",
            "docs": [
                "Used as a bitwise mask for the product category",
                "this isn't a scalable way to store all the product categories - revisit this"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "None"
                    },
                    {
                        "name": "Media"
                    },
                    {
                        "name": "Merch"
                    },
                    {
                        "name": "Event"
                    },
                    {
                        "name": "Social"
                    }
                ]
            }
        },
        {
            "name": "ProductType",
            "docs": [
                "Used as a bitwise mask for the product type",
                "this isn't a scalable way to store all the product types - revisit this"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "None"
                    },
                    {
                        "name": "Music"
                    },
                    {
                        "name": "Video"
                    },
                    {
                        "name": "Clothing"
                    },
                    {
                        "name": "Concert"
                    },
                    {
                        "name": "Conference"
                    },
                    {
                        "name": "Award"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "PublicKeyMismatch",
            "msg": "PublicKeyMismatch"
        },
        {
            "code": 6001,
            "name": "InvalidMintAuthority",
            "msg": "InvalidMintAuthority"
        },
        {
            "code": 6002,
            "name": "UninitializedAccount",
            "msg": "UninitializedAccount"
        },
        {
            "code": 6003,
            "name": "IncorrectOwner",
            "msg": "IncorrectOwner"
        },
        {
            "code": 6004,
            "name": "StoreNumberDoesntMatchCompanyStoreCount",
            "msg": "StoreNumberDoesntMatchCompanyStoreCount"
        },
        {
            "code": 6005,
            "name": "NotMutable",
            "msg": "NotMutable"
        }
    ]
};
