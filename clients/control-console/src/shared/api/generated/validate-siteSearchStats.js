// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const siteSearchStatsInput = validate951;
const schema1104 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' } },
      required: ['id'],
    },
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['tenantId'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/siteSearchStatsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
const func1 = ucs2Length;
function validate951(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteSearchStatsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate951.evaluated;
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
    if (data.query === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.id === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.tenantId === undefined) {
          const err6 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err7 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
          } else {
            const err8 = {
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
        if (data2.from !== undefined) {
          let data4 = data2.from;
          if (typeof data4 === 'string') {
            if (!formats10.validate(data4)) {
              const err9 = {
                instancePath: instancePath + '/query/from',
                schemaPath: '#/properties/query/properties/from/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/query/from',
              schemaPath: '#/properties/query/properties/from/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data2.to !== undefined) {
          let data5 = data2.to;
          if (typeof data5 === 'string') {
            if (!formats10.validate(data5)) {
              const err11 = {
                instancePath: instancePath + '/query/to',
                schemaPath: '#/properties/query/properties/to/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          } else {
            const err12 = {
              instancePath: instancePath + '/query/to',
              schemaPath: '#/properties/query/properties/to/type',
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
        if (data2.fields !== undefined) {
          let data6 = data2.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err13 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err14 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
          } else {
            const err15 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
      } else {
        const err16 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err17];
    } else {
      vErrors.push(err17);
    }
    errors++;
  }
  validate951.errors = vErrors;
  return errors === 0;
}
validate951.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const siteSearchStatsOutput = validate952;
const schema1105 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Search' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSearch',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/siteSearchStatsOutput',
};
const schema1106 = {
  type: 'object',
  properties: {
    searches: { type: 'integer', format: 'int64' },
    observable: { type: 'integer', format: 'int64' },
    clicked: { type: 'integer', format: 'int64' },
    clickRate: { type: 'number', format: 'double' },
    popular: { type: 'array', items: { $ref: '#/components/schemas/Ranked' } },
    zeroResults: {
      type: 'array',
      items: { $ref: '#/components/schemas/Ranked' },
    },
    health: { $ref: '#/components/schemas/Health' },
  },
};
const schema1087 = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    count: { type: 'integer', format: 'int64' },
  },
};
const schema1090 = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    lossDetected: { type: 'boolean' },
    staleSources: { type: 'integer', format: 'int64' },
    retainedFrom: { type: 'string', format: 'date-time' },
  },
};
function validate953(
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
  const evaluated0 = validate953.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.searches !== undefined) {
      let data0 = data.searches;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/searches',
          schemaPath: '#/properties/searches/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.observable !== undefined) {
      let data1 = data.observable;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/observable',
          schemaPath: '#/properties/observable/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.clicked !== undefined) {
      let data2 = data.clicked;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/clicked',
          schemaPath: '#/properties/clicked/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.clickRate !== undefined) {
      if (!(typeof data.clickRate == 'number')) {
        const err3 = {
          instancePath: instancePath + '/clickRate',
          schemaPath: '#/properties/clickRate/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.popular !== undefined) {
      let data4 = data.popular;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.label !== undefined) {
              if (typeof data5.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/popular/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data5.count !== undefined) {
              let data7 = data5.count;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err5 = {
                  instancePath: instancePath + '/popular/' + i0 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/popular/' + i0,
              schemaPath: '#/components/schemas/Ranked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/popular',
          schemaPath: '#/properties/popular/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.zeroResults !== undefined) {
      let data8 = data.zeroResults;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data9 = data8[i1];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.label !== undefined) {
              if (typeof data9.label !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data9.count !== undefined) {
              let data11 = data9.count;
              if (!(
                typeof data11 == 'number' &&
                !(data11 % 1) &&
                !isNaN(data11)
              )) {
                const err9 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/zeroResults/' + i1,
              schemaPath: '#/components/schemas/Ranked/type',
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
          instancePath: instancePath + '/zeroResults',
          schemaPath: '#/properties/zeroResults/type',
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
    if (data.health !== undefined) {
      let data12 = data.health;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        if (data12.status !== undefined) {
          if (typeof data12.status !== 'string') {
            const err12 = {
              instancePath: instancePath + '/health/status',
              schemaPath: '#/components/schemas/Health/properties/status/type',
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
        if (data12.updatedAt !== undefined) {
          let data14 = data12.updatedAt;
          if (typeof data14 === 'string') {
            if (!formats10.validate(data14)) {
              const err13 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/Health/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/Health/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data12.lossDetected !== undefined) {
          if (typeof data12.lossDetected !== 'boolean') {
            const err15 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/Health/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data12.staleSources !== undefined) {
          let data16 = data12.staleSources;
          if (!(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16))) {
            const err16 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/Health/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
        if (data12.retainedFrom !== undefined) {
          let data17 = data12.retainedFrom;
          if (typeof data17 === 'string') {
            if (!formats10.validate(data17)) {
              const err17 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/Health/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/Health/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/Health/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate953.errors = vErrors;
  return errors === 0;
}
validate953.evaluated = {
  props: {
    searches: true,
    observable: true,
    clicked: true,
    clickRate: true,
    popular: true,
    zeroResults: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1110 = {
  type: 'object',
  properties: {
    searches: { type: 'integer', format: 'int64' },
    observable: { type: 'integer', format: 'int64' },
    clicked: { type: 'integer', format: 'int64' },
    clickRate: { type: 'number', format: 'double' },
    popular: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRanked' },
    },
    zeroResults: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRanked' },
    },
    health: { $ref: '#/components/schemas/PartialHealth' },
  },
};
const schema1093 = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    count: { type: 'integer', format: 'int64' },
  },
};
const schema1096 = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    updatedAt: { type: 'string', format: 'date-time' },
    lossDetected: { type: 'boolean' },
    staleSources: { type: 'integer', format: 'int64' },
    retainedFrom: { type: 'string', format: 'date-time' },
  },
};
function validate955(
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
  const evaluated0 = validate955.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.searches !== undefined) {
      let data0 = data.searches;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/searches',
          schemaPath: '#/properties/searches/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.observable !== undefined) {
      let data1 = data.observable;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/observable',
          schemaPath: '#/properties/observable/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.clicked !== undefined) {
      let data2 = data.clicked;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/clicked',
          schemaPath: '#/properties/clicked/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.clickRate !== undefined) {
      if (!(typeof data.clickRate == 'number')) {
        const err3 = {
          instancePath: instancePath + '/clickRate',
          schemaPath: '#/properties/clickRate/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.popular !== undefined) {
      let data4 = data.popular;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.label !== undefined) {
              if (typeof data5.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/popular/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data5.count !== undefined) {
              let data7 = data5.count;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err5 = {
                  instancePath: instancePath + '/popular/' + i0 + '/count',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/popular/' + i0,
              schemaPath: '#/components/schemas/PartialRanked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/popular',
          schemaPath: '#/properties/popular/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.zeroResults !== undefined) {
      let data8 = data.zeroResults;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data9 = data8[i1];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.label !== undefined) {
              if (typeof data9.label !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data9.count !== undefined) {
              let data11 = data9.count;
              if (!(
                typeof data11 == 'number' &&
                !(data11 % 1) &&
                !isNaN(data11)
              )) {
                const err9 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/zeroResults/' + i1,
              schemaPath: '#/components/schemas/PartialRanked/type',
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
          instancePath: instancePath + '/zeroResults',
          schemaPath: '#/properties/zeroResults/type',
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
    if (data.health !== undefined) {
      let data12 = data.health;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        if (data12.status !== undefined) {
          if (typeof data12.status !== 'string') {
            const err12 = {
              instancePath: instancePath + '/health/status',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/status/type',
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
        if (data12.updatedAt !== undefined) {
          let data14 = data12.updatedAt;
          if (typeof data14 === 'string') {
            if (!formats10.validate(data14)) {
              const err13 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/PartialHealth/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data12.lossDetected !== undefined) {
          if (typeof data12.lossDetected !== 'boolean') {
            const err15 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data12.staleSources !== undefined) {
          let data16 = data12.staleSources;
          if (!(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16))) {
            const err16 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
        if (data12.retainedFrom !== undefined) {
          let data17 = data12.retainedFrom;
          if (typeof data17 === 'string') {
            if (!formats10.validate(data17)) {
              const err17 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/PartialHealth/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/PartialHealth/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate955.errors = vErrors;
  return errors === 0;
}
validate955.evaluated = {
  props: {
    searches: true,
    observable: true,
    clicked: true,
    clickRate: true,
    popular: true,
    zeroResults: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate952(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteSearchStatsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate952.evaluated;
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
    !validate953(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate953.errors
        : vErrors.concat(validate953.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.searches = true;
    props0.observable = true;
    props0.clicked = true;
    props0.clickRate = true;
    props0.popular = true;
    props0.zeroResults = true;
    props0.health = true;
  }
  const _errs2 = errors;
  if (
    !validate955(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate955.errors
        : vErrors.concat(validate955.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.searches = true;
      props0.observable = true;
      props0.clicked = true;
      props0.clickRate = true;
      props0.popular = true;
      props0.zeroResults = true;
      props0.health = true;
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
  validate952.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate952.evaluated = { dynamicProps: true, dynamicItems: false };
export const siteSearchStatsOutputFull = validate957;
const schema1114 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Search',
  $id: 'https://edition.invalid/validators/siteSearchStatsOutputFull',
};
function validate958(
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
  const evaluated0 = validate958.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.searches !== undefined) {
      let data0 = data.searches;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/searches',
          schemaPath: '#/properties/searches/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.observable !== undefined) {
      let data1 = data.observable;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/observable',
          schemaPath: '#/properties/observable/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.clicked !== undefined) {
      let data2 = data.clicked;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/clicked',
          schemaPath: '#/properties/clicked/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.clickRate !== undefined) {
      if (!(typeof data.clickRate == 'number')) {
        const err3 = {
          instancePath: instancePath + '/clickRate',
          schemaPath: '#/properties/clickRate/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.popular !== undefined) {
      let data4 = data.popular;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.label !== undefined) {
              if (typeof data5.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/popular/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data5.count !== undefined) {
              let data7 = data5.count;
              if (!(
                typeof data7 == 'number' &&
                !(data7 % 1) &&
                !isNaN(data7)
              )) {
                const err5 = {
                  instancePath: instancePath + '/popular/' + i0 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/popular/' + i0,
              schemaPath: '#/components/schemas/Ranked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/popular',
          schemaPath: '#/properties/popular/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.zeroResults !== undefined) {
      let data8 = data.zeroResults;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data9 = data8[i1];
          if (data9 && typeof data9 == 'object' && !Array.isArray(data9)) {
            if (data9.label !== undefined) {
              if (typeof data9.label !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data9.count !== undefined) {
              let data11 = data9.count;
              if (!(
                typeof data11 == 'number' &&
                !(data11 % 1) &&
                !isNaN(data11)
              )) {
                const err9 = {
                  instancePath: instancePath + '/zeroResults/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/zeroResults/' + i1,
              schemaPath: '#/components/schemas/Ranked/type',
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
          instancePath: instancePath + '/zeroResults',
          schemaPath: '#/properties/zeroResults/type',
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
    if (data.health !== undefined) {
      let data12 = data.health;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        if (data12.status !== undefined) {
          if (typeof data12.status !== 'string') {
            const err12 = {
              instancePath: instancePath + '/health/status',
              schemaPath: '#/components/schemas/Health/properties/status/type',
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
        if (data12.updatedAt !== undefined) {
          let data14 = data12.updatedAt;
          if (typeof data14 === 'string') {
            if (!formats10.validate(data14)) {
              const err13 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/Health/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/Health/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data12.lossDetected !== undefined) {
          if (typeof data12.lossDetected !== 'boolean') {
            const err15 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/Health/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data12.staleSources !== undefined) {
          let data16 = data12.staleSources;
          if (!(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16))) {
            const err16 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/Health/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
        if (data12.retainedFrom !== undefined) {
          let data17 = data12.retainedFrom;
          if (typeof data17 === 'string') {
            if (!formats10.validate(data17)) {
              const err17 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/Health/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/Health/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/Health/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
  } else {
    const err20 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err20];
    } else {
      vErrors.push(err20);
    }
    errors++;
  }
  validate958.errors = vErrors;
  return errors === 0;
}
validate958.evaluated = {
  props: {
    searches: true,
    observable: true,
    clicked: true,
    clickRate: true,
    popular: true,
    zeroResults: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate957(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteSearchStatsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate957.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate958(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate958.errors
        : vErrors.concat(validate958.errors);
    errors = vErrors.length;
  }
  validate957.errors = vErrors;
  return errors === 0;
}
validate957.evaluated = {
  props: {
    searches: true,
    observable: true,
    clicked: true,
    clickRate: true,
    popular: true,
    zeroResults: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
