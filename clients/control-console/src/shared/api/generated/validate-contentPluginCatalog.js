// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const contentPluginCatalogInput = validate1433;
const schema1577 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/contentPluginCatalogInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1433(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/contentPluginCatalogInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1433.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
          } else {
            const err3 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.fields !== undefined) {
          let data3 = data2.fields;
          if (typeof data3 === 'string') {
            if (func1(data3) > 4096) {
              const err5 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err6 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate1433.errors = vErrors;
  return errors === 0;
}
validate1433.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const contentPluginCatalogOutput = validate1434;
const schema1578 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Catalog' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialCatalog',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/contentPluginCatalogOutput',
};
const schema1579 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/Descriptor' },
    },
    productionLoading: { type: 'string' },
    canDevelop: { type: 'boolean' },
  },
};
const schema1580 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    version: { type: 'string' },
    contentTypes: { type: 'array', items: { type: 'string' } },
    formats: { type: 'array', items: { type: 'string' } },
    capabilities: { type: 'array', items: { type: 'string' } },
    trusted: { type: 'boolean' },
  },
};
function validate1435(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1435.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              if (typeof data1.id !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/id/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.version !== undefined) {
              if (typeof data1.version !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/version',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/version/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data1.contentTypes !== undefined) {
              let data5 = data1.contentTypes;
              if (Array.isArray(data5)) {
                const len1 = data5.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data5[i1] !== 'string') {
                    const err3 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/contentTypes/' + i1,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/contentTypes/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err3];
                    } else {
                      vErrors.push(err3);
                    }
                    errors++;
                  }
                }
              } else {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentTypes',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/contentTypes/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.formats !== undefined) {
              let data7 = data1.formats;
              if (Array.isArray(data7)) {
                const len2 = data7.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data7[i2] !== 'string') {
                    const err5 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/formats/' + i2,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/formats/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  }
                }
              } else {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/formats',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/formats/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.capabilities !== undefined) {
              let data9 = data1.capabilities;
              if (Array.isArray(data9)) {
                const len3 = data9.length;
                for (let i3 = 0; i3 < len3; i3++) {
                  if (typeof data9[i3] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/capabilities/' + i3,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/capabilities/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/capabilities',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/capabilities/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.trusted !== undefined) {
              if (typeof data1.trusted !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/trusted',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/trusted/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Descriptor/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.productionLoading !== undefined) {
      if (typeof data.productionLoading !== 'string') {
        const err12 = {
          instancePath: instancePath + '/productionLoading',
          schemaPath: '#/properties/productionLoading/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.canDevelop !== undefined) {
      if (typeof data.canDevelop !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/canDevelop',
          schemaPath: '#/properties/canDevelop/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate1435.errors = vErrors;
  return errors === 0;
}
validate1435.evaluated = {
  props: { items: true, productionLoading: true, canDevelop: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1581 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDescriptor' },
    },
    productionLoading: { type: 'string' },
    canDevelop: { type: 'boolean' },
  },
};
const schema1582 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    version: { type: 'string' },
    contentTypes: { type: 'array', items: { type: 'string' } },
    formats: { type: 'array', items: { type: 'string' } },
    capabilities: { type: 'array', items: { type: 'string' } },
    trusted: { type: 'boolean' },
  },
};
function validate1437(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1437.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              if (typeof data1.id !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/id/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.version !== undefined) {
              if (typeof data1.version !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/version',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/version/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data1.contentTypes !== undefined) {
              let data5 = data1.contentTypes;
              if (Array.isArray(data5)) {
                const len1 = data5.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data5[i1] !== 'string') {
                    const err3 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/contentTypes/' + i1,
                      schemaPath:
                        '#/components/schemas/PartialDescriptor/properties/contentTypes/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err3];
                    } else {
                      vErrors.push(err3);
                    }
                    errors++;
                  }
                }
              } else {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentTypes',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/contentTypes/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.formats !== undefined) {
              let data7 = data1.formats;
              if (Array.isArray(data7)) {
                const len2 = data7.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data7[i2] !== 'string') {
                    const err5 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/formats/' + i2,
                      schemaPath:
                        '#/components/schemas/PartialDescriptor/properties/formats/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  }
                }
              } else {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/formats',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/formats/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.capabilities !== undefined) {
              let data9 = data1.capabilities;
              if (Array.isArray(data9)) {
                const len3 = data9.length;
                for (let i3 = 0; i3 < len3; i3++) {
                  if (typeof data9[i3] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/capabilities/' + i3,
                      schemaPath:
                        '#/components/schemas/PartialDescriptor/properties/capabilities/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/capabilities',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/capabilities/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.trusted !== undefined) {
              if (typeof data1.trusted !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/trusted',
                  schemaPath:
                    '#/components/schemas/PartialDescriptor/properties/trusted/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialDescriptor/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.productionLoading !== undefined) {
      if (typeof data.productionLoading !== 'string') {
        const err12 = {
          instancePath: instancePath + '/productionLoading',
          schemaPath: '#/properties/productionLoading/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.canDevelop !== undefined) {
      if (typeof data.canDevelop !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/canDevelop',
          schemaPath: '#/properties/canDevelop/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate1437.errors = vErrors;
  return errors === 0;
}
validate1437.evaluated = {
  props: { items: true, productionLoading: true, canDevelop: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1434(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/contentPluginCatalogOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1434.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate1435(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1435.errors
        : vErrors.concat(validate1435.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.productionLoading = true;
    props0.canDevelop = true;
  }
  const _errs2 = errors;
  if (
    !validate1437(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1437.errors
        : vErrors.concat(validate1437.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.productionLoading = true;
      props0.canDevelop = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate1434.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1434.evaluated = { dynamicProps: true, dynamicItems: false };
export const contentPluginCatalogOutputFull = validate1439;
const schema1583 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Catalog',
  $id: 'https://edition.invalid/validators/contentPluginCatalogOutputFull',
};
function validate1440(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1440.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              if (typeof data1.id !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/id/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err0];
                } else {
                  vErrors.push(err0);
                }
                errors++;
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/name/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err1];
                } else {
                  vErrors.push(err1);
                }
                errors++;
              }
            }
            if (data1.version !== undefined) {
              if (typeof data1.version !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/version',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/version/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err2];
                } else {
                  vErrors.push(err2);
                }
                errors++;
              }
            }
            if (data1.contentTypes !== undefined) {
              let data5 = data1.contentTypes;
              if (Array.isArray(data5)) {
                const len1 = data5.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  if (typeof data5[i1] !== 'string') {
                    const err3 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/contentTypes/' + i1,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/contentTypes/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err3];
                    } else {
                      vErrors.push(err3);
                    }
                    errors++;
                  }
                }
              } else {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentTypes',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/contentTypes/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.formats !== undefined) {
              let data7 = data1.formats;
              if (Array.isArray(data7)) {
                const len2 = data7.length;
                for (let i2 = 0; i2 < len2; i2++) {
                  if (typeof data7[i2] !== 'string') {
                    const err5 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/formats/' + i2,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/formats/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err5];
                    } else {
                      vErrors.push(err5);
                    }
                    errors++;
                  }
                }
              } else {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/formats',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/formats/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data1.capabilities !== undefined) {
              let data9 = data1.capabilities;
              if (Array.isArray(data9)) {
                const len3 = data9.length;
                for (let i3 = 0; i3 < len3; i3++) {
                  if (typeof data9[i3] !== 'string') {
                    const err7 = {
                      instancePath:
                        instancePath + '/items/' + i0 + '/capabilities/' + i3,
                      schemaPath:
                        '#/components/schemas/Descriptor/properties/capabilities/items/type',
                      keyword: 'type',
                      params: { type: 'string' },
                      message: 'must be string',
                    };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                }
              } else {
                const err8 = {
                  instancePath: instancePath + '/items/' + i0 + '/capabilities',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/capabilities/type',
                  keyword: 'type',
                  params: { type: 'array' },
                  message: 'must be array',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data1.trusted !== undefined) {
              if (typeof data1.trusted !== 'boolean') {
                const err9 = {
                  instancePath: instancePath + '/items/' + i0 + '/trusted',
                  schemaPath:
                    '#/components/schemas/Descriptor/properties/trusted/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/Descriptor/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.productionLoading !== undefined) {
      if (typeof data.productionLoading !== 'string') {
        const err12 = {
          instancePath: instancePath + '/productionLoading',
          schemaPath: '#/properties/productionLoading/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.canDevelop !== undefined) {
      if (typeof data.canDevelop !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/canDevelop',
          schemaPath: '#/properties/canDevelop/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate1440.errors = vErrors;
  return errors === 0;
}
validate1440.evaluated = {
  props: { items: true, productionLoading: true, canDevelop: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1439(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/contentPluginCatalogOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1439.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1440(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1440.errors
        : vErrors.concat(validate1440.errors);
    errors = vErrors.length;
  }
  validate1439.errors = vErrors;
  return errors === 0;
}
validate1439.evaluated = {
  props: { items: true, productionLoading: true, canDevelop: true },
  dynamicProps: false,
  dynamicItems: false,
};
