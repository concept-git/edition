// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const siteTrafficInput = validate942;
const schema1083 = {
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
        granularity: { type: 'string', default: 'day' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['tenantId'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/siteTrafficInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
const func1 = ucs2Length;
function validate942(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteTrafficInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate942.evaluated;
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
        if (data2.granularity !== undefined) {
          if (typeof data2.granularity !== 'string') {
            const err13 = {
              instancePath: instancePath + '/query/granularity',
              schemaPath: '#/properties/query/properties/granularity/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data2.fields !== undefined) {
          let data7 = data2.fields;
          if (typeof data7 === 'string') {
            if (func1(data7) > 4096) {
              const err14 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (func1(data7) < 1) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          } else {
            const err16 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err18 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err18];
    } else {
      vErrors.push(err18);
    }
    errors++;
  }
  validate942.errors = vErrors;
  return errors === 0;
}
validate942.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const siteTrafficOutput = validate943;
const schema1084 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Traffic' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTraffic',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/siteTrafficOutput',
};
const schema1085 = {
  type: 'object',
  properties: {
    pv: { type: 'integer', format: 'int64' },
    series: { type: 'array', items: { $ref: '#/components/schemas/Bucket' } },
    pages: { type: 'array', items: { $ref: '#/components/schemas/Ranked' } },
    notFound: { type: 'array', items: { $ref: '#/components/schemas/Ranked' } },
    referrers: {
      type: 'array',
      items: { $ref: '#/components/schemas/Ranked' },
    },
    health: { $ref: '#/components/schemas/Health' },
  },
};
const schema1086 = {
  type: 'object',
  properties: {
    time: { type: 'string', format: 'date-time' },
    pv: { type: 'integer', format: 'int64' },
    uv: { type: 'integer', format: 'int64' },
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
function validate944(
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
  const evaluated0 = validate944.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pv !== undefined) {
      let data0 = data.pv;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/pv',
          schemaPath: '#/properties/pv/type',
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
    if (data.series !== undefined) {
      let data1 = data.series;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.time !== undefined) {
              let data3 = data2.time;
              if (typeof data3 === 'string') {
                if (!formats10.validate(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/series/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/Bucket/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err1];
                  } else {
                    vErrors.push(err1);
                  }
                  errors++;
                }
              } else {
                const err2 = {
                  instancePath: instancePath + '/series/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/Bucket/properties/time/type',
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
            if (data2.pv !== undefined) {
              let data4 = data2.pv;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err3 = {
                  instancePath: instancePath + '/series/' + i0 + '/pv',
                  schemaPath: '#/components/schemas/Bucket/properties/pv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data2.uv !== undefined) {
              let data5 = data2.uv;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/series/' + i0 + '/uv',
                  schemaPath: '#/components/schemas/Bucket/properties/uv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/series/' + i0,
              schemaPath: '#/components/schemas/Bucket/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/series',
          schemaPath: '#/properties/series/type',
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
    if (data.pages !== undefined) {
      let data6 = data.pages;
      if (Array.isArray(data6)) {
        const len1 = data6.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data7 = data6[i1];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.label !== undefined) {
              if (typeof data7.label !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/pages/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
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
            if (data7.count !== undefined) {
              let data9 = data7.count;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err8 = {
                  instancePath: instancePath + '/pages/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/pages/' + i1,
              schemaPath: '#/components/schemas/Ranked/type',
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
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/pages',
          schemaPath: '#/properties/pages/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.notFound !== undefined) {
      let data10 = data.notFound;
      if (Array.isArray(data10)) {
        const len2 = data10.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data11 = data10[i2];
          if (data11 && typeof data11 == 'object' && !Array.isArray(data11)) {
            if (data11.label !== undefined) {
              if (typeof data11.label !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data11.count !== undefined) {
              let data13 = data11.count;
              if (!(
                typeof data13 == 'number' &&
                !(data13 % 1) &&
                !isNaN(data13)
              )) {
                const err12 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/notFound/' + i2,
              schemaPath: '#/components/schemas/Ranked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/notFound',
          schemaPath: '#/properties/notFound/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.referrers !== undefined) {
      let data14 = data.referrers;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i3 = 0; i3 < len3; i3++) {
          let data15 = data14[i3];
          if (data15 && typeof data15 == 'object' && !Array.isArray(data15)) {
            if (data15.label !== undefined) {
              if (typeof data15.label !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
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
            if (data15.count !== undefined) {
              let data17 = data15.count;
              if (!(
                typeof data17 == 'number' &&
                !(data17 % 1) &&
                !isNaN(data17)
              )) {
                const err16 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
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
          } else {
            const err17 = {
              instancePath: instancePath + '/referrers/' + i3,
              schemaPath: '#/components/schemas/Ranked/type',
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
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/referrers',
          schemaPath: '#/properties/referrers/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.health !== undefined) {
      let data18 = data.health;
      if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
        if (data18.status !== undefined) {
          if (typeof data18.status !== 'string') {
            const err19 = {
              instancePath: instancePath + '/health/status',
              schemaPath: '#/components/schemas/Health/properties/status/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data18.updatedAt !== undefined) {
          let data20 = data18.updatedAt;
          if (typeof data20 === 'string') {
            if (!formats10.validate(data20)) {
              const err20 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/Health/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/Health/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data18.lossDetected !== undefined) {
          if (typeof data18.lossDetected !== 'boolean') {
            const err22 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/Health/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        if (data18.staleSources !== undefined) {
          let data22 = data18.staleSources;
          if (!(typeof data22 == 'number' && !(data22 % 1) && !isNaN(data22))) {
            const err23 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/Health/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data18.retainedFrom !== undefined) {
          let data23 = data18.retainedFrom;
          if (typeof data23 === 'string') {
            if (!formats10.validate(data23)) {
              const err24 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/Health/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/Health/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
      } else {
        const err26 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/Health/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err27];
    } else {
      vErrors.push(err27);
    }
    errors++;
  }
  validate944.errors = vErrors;
  return errors === 0;
}
validate944.evaluated = {
  props: {
    pv: true,
    series: true,
    pages: true,
    notFound: true,
    referrers: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1091 = {
  type: 'object',
  properties: {
    pv: { type: 'integer', format: 'int64' },
    series: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialBucket' },
    },
    pages: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRanked' },
    },
    notFound: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRanked' },
    },
    referrers: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialRanked' },
    },
    health: { $ref: '#/components/schemas/PartialHealth' },
  },
};
const schema1092 = {
  type: 'object',
  properties: {
    time: { type: 'string', format: 'date-time' },
    pv: { type: 'integer', format: 'int64' },
    uv: { type: 'integer', format: 'int64' },
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
function validate946(
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
  const evaluated0 = validate946.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pv !== undefined) {
      let data0 = data.pv;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/pv',
          schemaPath: '#/properties/pv/type',
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
    if (data.series !== undefined) {
      let data1 = data.series;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.time !== undefined) {
              let data3 = data2.time;
              if (typeof data3 === 'string') {
                if (!formats10.validate(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/series/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/PartialBucket/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err1];
                  } else {
                    vErrors.push(err1);
                  }
                  errors++;
                }
              } else {
                const err2 = {
                  instancePath: instancePath + '/series/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/PartialBucket/properties/time/type',
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
            if (data2.pv !== undefined) {
              let data4 = data2.pv;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err3 = {
                  instancePath: instancePath + '/series/' + i0 + '/pv',
                  schemaPath:
                    '#/components/schemas/PartialBucket/properties/pv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data2.uv !== undefined) {
              let data5 = data2.uv;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/series/' + i0 + '/uv',
                  schemaPath:
                    '#/components/schemas/PartialBucket/properties/uv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/series/' + i0,
              schemaPath: '#/components/schemas/PartialBucket/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/series',
          schemaPath: '#/properties/series/type',
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
    if (data.pages !== undefined) {
      let data6 = data.pages;
      if (Array.isArray(data6)) {
        const len1 = data6.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data7 = data6[i1];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.label !== undefined) {
              if (typeof data7.label !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/pages/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/label/type',
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
            if (data7.count !== undefined) {
              let data9 = data7.count;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err8 = {
                  instancePath: instancePath + '/pages/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/pages/' + i1,
              schemaPath: '#/components/schemas/PartialRanked/type',
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
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/pages',
          schemaPath: '#/properties/pages/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.notFound !== undefined) {
      let data10 = data.notFound;
      if (Array.isArray(data10)) {
        const len2 = data10.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data11 = data10[i2];
          if (data11 && typeof data11 == 'object' && !Array.isArray(data11)) {
            if (data11.label !== undefined) {
              if (typeof data11.label !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data11.count !== undefined) {
              let data13 = data11.count;
              if (!(
                typeof data13 == 'number' &&
                !(data13 % 1) &&
                !isNaN(data13)
              )) {
                const err12 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/count',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/notFound/' + i2,
              schemaPath: '#/components/schemas/PartialRanked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/notFound',
          schemaPath: '#/properties/notFound/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.referrers !== undefined) {
      let data14 = data.referrers;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i3 = 0; i3 < len3; i3++) {
          let data15 = data14[i3];
          if (data15 && typeof data15 == 'object' && !Array.isArray(data15)) {
            if (data15.label !== undefined) {
              if (typeof data15.label !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/label/type',
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
            if (data15.count !== undefined) {
              let data17 = data15.count;
              if (!(
                typeof data17 == 'number' &&
                !(data17 % 1) &&
                !isNaN(data17)
              )) {
                const err16 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/count',
                  schemaPath:
                    '#/components/schemas/PartialRanked/properties/count/type',
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
          } else {
            const err17 = {
              instancePath: instancePath + '/referrers/' + i3,
              schemaPath: '#/components/schemas/PartialRanked/type',
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
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/referrers',
          schemaPath: '#/properties/referrers/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.health !== undefined) {
      let data18 = data.health;
      if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
        if (data18.status !== undefined) {
          if (typeof data18.status !== 'string') {
            const err19 = {
              instancePath: instancePath + '/health/status',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/status/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data18.updatedAt !== undefined) {
          let data20 = data18.updatedAt;
          if (typeof data20 === 'string') {
            if (!formats10.validate(data20)) {
              const err20 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/PartialHealth/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data18.lossDetected !== undefined) {
          if (typeof data18.lossDetected !== 'boolean') {
            const err22 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        if (data18.staleSources !== undefined) {
          let data22 = data18.staleSources;
          if (!(typeof data22 == 'number' && !(data22 % 1) && !isNaN(data22))) {
            const err23 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data18.retainedFrom !== undefined) {
          let data23 = data18.retainedFrom;
          if (typeof data23 === 'string') {
            if (!formats10.validate(data23)) {
              const err24 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/PartialHealth/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/PartialHealth/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
      } else {
        const err26 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/PartialHealth/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err27];
    } else {
      vErrors.push(err27);
    }
    errors++;
  }
  validate946.errors = vErrors;
  return errors === 0;
}
validate946.evaluated = {
  props: {
    pv: true,
    series: true,
    pages: true,
    notFound: true,
    referrers: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate943(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteTrafficOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate943.evaluated;
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
    !validate944(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate944.errors
        : vErrors.concat(validate944.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.pv = true;
    props0.series = true;
    props0.pages = true;
    props0.notFound = true;
    props0.referrers = true;
    props0.health = true;
  }
  const _errs2 = errors;
  if (
    !validate946(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate946.errors
        : vErrors.concat(validate946.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.pv = true;
      props0.series = true;
      props0.pages = true;
      props0.notFound = true;
      props0.referrers = true;
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
  validate943.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate943.evaluated = { dynamicProps: true, dynamicItems: false };
export const siteTrafficOutputFull = validate948;
const schema1097 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Traffic',
  $id: 'https://edition.invalid/validators/siteTrafficOutputFull',
};
function validate949(
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
  const evaluated0 = validate949.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pv !== undefined) {
      let data0 = data.pv;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/pv',
          schemaPath: '#/properties/pv/type',
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
    if (data.series !== undefined) {
      let data1 = data.series;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.time !== undefined) {
              let data3 = data2.time;
              if (typeof data3 === 'string') {
                if (!formats10.validate(data3)) {
                  const err1 = {
                    instancePath: instancePath + '/series/' + i0 + '/time',
                    schemaPath:
                      '#/components/schemas/Bucket/properties/time/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err1];
                  } else {
                    vErrors.push(err1);
                  }
                  errors++;
                }
              } else {
                const err2 = {
                  instancePath: instancePath + '/series/' + i0 + '/time',
                  schemaPath:
                    '#/components/schemas/Bucket/properties/time/type',
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
            if (data2.pv !== undefined) {
              let data4 = data2.pv;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err3 = {
                  instancePath: instancePath + '/series/' + i0 + '/pv',
                  schemaPath: '#/components/schemas/Bucket/properties/pv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data2.uv !== undefined) {
              let data5 = data2.uv;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/series/' + i0 + '/uv',
                  schemaPath: '#/components/schemas/Bucket/properties/uv/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/series/' + i0,
              schemaPath: '#/components/schemas/Bucket/type',
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
      } else {
        const err6 = {
          instancePath: instancePath + '/series',
          schemaPath: '#/properties/series/type',
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
    if (data.pages !== undefined) {
      let data6 = data.pages;
      if (Array.isArray(data6)) {
        const len1 = data6.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data7 = data6[i1];
          if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
            if (data7.label !== undefined) {
              if (typeof data7.label !== 'string') {
                const err7 = {
                  instancePath: instancePath + '/pages/' + i1 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
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
            if (data7.count !== undefined) {
              let data9 = data7.count;
              if (!(
                typeof data9 == 'number' &&
                !(data9 % 1) &&
                !isNaN(data9)
              )) {
                const err8 = {
                  instancePath: instancePath + '/pages/' + i1 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
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
              instancePath: instancePath + '/pages/' + i1,
              schemaPath: '#/components/schemas/Ranked/type',
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
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/pages',
          schemaPath: '#/properties/pages/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.notFound !== undefined) {
      let data10 = data.notFound;
      if (Array.isArray(data10)) {
        const len2 = data10.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data11 = data10[i2];
          if (data11 && typeof data11 == 'object' && !Array.isArray(data11)) {
            if (data11.label !== undefined) {
              if (typeof data11.label !== 'string') {
                const err11 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data11.count !== undefined) {
              let data13 = data11.count;
              if (!(
                typeof data13 == 'number' &&
                !(data13 % 1) &&
                !isNaN(data13)
              )) {
                const err12 = {
                  instancePath: instancePath + '/notFound/' + i2 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/notFound/' + i2,
              schemaPath: '#/components/schemas/Ranked/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
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
          instancePath: instancePath + '/notFound',
          schemaPath: '#/properties/notFound/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.referrers !== undefined) {
      let data14 = data.referrers;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i3 = 0; i3 < len3; i3++) {
          let data15 = data14[i3];
          if (data15 && typeof data15 == 'object' && !Array.isArray(data15)) {
            if (data15.label !== undefined) {
              if (typeof data15.label !== 'string') {
                const err15 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/label',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/label/type',
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
            if (data15.count !== undefined) {
              let data17 = data15.count;
              if (!(
                typeof data17 == 'number' &&
                !(data17 % 1) &&
                !isNaN(data17)
              )) {
                const err16 = {
                  instancePath: instancePath + '/referrers/' + i3 + '/count',
                  schemaPath:
                    '#/components/schemas/Ranked/properties/count/type',
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
          } else {
            const err17 = {
              instancePath: instancePath + '/referrers/' + i3,
              schemaPath: '#/components/schemas/Ranked/type',
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
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/referrers',
          schemaPath: '#/properties/referrers/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.health !== undefined) {
      let data18 = data.health;
      if (data18 && typeof data18 == 'object' && !Array.isArray(data18)) {
        if (data18.status !== undefined) {
          if (typeof data18.status !== 'string') {
            const err19 = {
              instancePath: instancePath + '/health/status',
              schemaPath: '#/components/schemas/Health/properties/status/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data18.updatedAt !== undefined) {
          let data20 = data18.updatedAt;
          if (typeof data20 === 'string') {
            if (!formats10.validate(data20)) {
              const err20 = {
                instancePath: instancePath + '/health/updatedAt',
                schemaPath:
                  '#/components/schemas/Health/properties/updatedAt/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = {
              instancePath: instancePath + '/health/updatedAt',
              schemaPath:
                '#/components/schemas/Health/properties/updatedAt/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data18.lossDetected !== undefined) {
          if (typeof data18.lossDetected !== 'boolean') {
            const err22 = {
              instancePath: instancePath + '/health/lossDetected',
              schemaPath:
                '#/components/schemas/Health/properties/lossDetected/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        if (data18.staleSources !== undefined) {
          let data22 = data18.staleSources;
          if (!(typeof data22 == 'number' && !(data22 % 1) && !isNaN(data22))) {
            const err23 = {
              instancePath: instancePath + '/health/staleSources',
              schemaPath:
                '#/components/schemas/Health/properties/staleSources/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data18.retainedFrom !== undefined) {
          let data23 = data18.retainedFrom;
          if (typeof data23 === 'string') {
            if (!formats10.validate(data23)) {
              const err24 = {
                instancePath: instancePath + '/health/retainedFrom',
                schemaPath:
                  '#/components/schemas/Health/properties/retainedFrom/format',
                keyword: 'format',
                params: { format: 'date-time' },
                message: 'must match format "' + 'date-time' + '"',
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            const err25 = {
              instancePath: instancePath + '/health/retainedFrom',
              schemaPath:
                '#/components/schemas/Health/properties/retainedFrom/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
      } else {
        const err26 = {
          instancePath: instancePath + '/health',
          schemaPath: '#/components/schemas/Health/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
  } else {
    const err27 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err27];
    } else {
      vErrors.push(err27);
    }
    errors++;
  }
  validate949.errors = vErrors;
  return errors === 0;
}
validate949.evaluated = {
  props: {
    pv: true,
    series: true,
    pages: true,
    notFound: true,
    referrers: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate948(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/siteTrafficOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate948.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate949(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate949.errors
        : vErrors.concat(validate949.errors);
    errors = vErrors.length;
  }
  validate948.errors = vErrors;
  return errors === 0;
}
validate948.evaluated = {
  props: {
    pv: true,
    series: true,
    pages: true,
    notFound: true,
    referrers: true,
    health: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
