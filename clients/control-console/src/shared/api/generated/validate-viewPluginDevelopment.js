// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewPluginDevelopmentInput = validate145;
const schema203 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        id: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'id'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewPluginDevelopmentInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate145(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginDevelopmentInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate145.evaluated;
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
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.id !== undefined) {
          let data2 = data0.id;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err11 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate145.errors = vErrors;
  return errors === 0;
}
validate145.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewPluginDevelopmentOutput = validate146;
const schema204 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Development' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialDevelopment',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewPluginDevelopmentOutput',
};
const schema205 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    contentType: { type: 'string' },
    revision: { type: 'integer', format: 'int32' },
    source: { $ref: '#/components/schemas/Source' },
    sourceDigest: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
const schema206 = {
  type: 'object',
  properties: {
    files: { type: 'object', additionalProperties: { type: 'string' } },
    manifest: { type: 'string' },
    configuration: { type: 'string' },
    fixtures: { type: 'string' },
    dependencyLock: { type: 'string' },
    baselineRef: { type: 'string' },
  },
};
const formats10 = fullFormats['date-time'];
function validate147(
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
  const evaluated0 = validate147.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.revision !== undefined) {
      let data3 = data.revision;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err4 = {
          instancePath: instancePath + '/revision',
          schemaPath: '#/properties/revision/type',
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
    if (data.source !== undefined) {
      let data4 = data.source;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.files !== undefined) {
          let data5 = data4.files;
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            for (const key0 in data5) {
              if (typeof data5[key0] !== 'string') {
                const err5 = {
                  instancePath:
                    instancePath +
                    '/source/files/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath:
                    '#/components/schemas/Source/properties/files/additionalProperties/type',
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
              instancePath: instancePath + '/source/files',
              schemaPath: '#/components/schemas/Source/properties/files/type',
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
        if (data4.manifest !== undefined) {
          if (typeof data4.manifest !== 'string') {
            const err7 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/Source/properties/manifest/type',
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
        if (data4.configuration !== undefined) {
          if (typeof data4.configuration !== 'string') {
            const err8 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/Source/properties/configuration/type',
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
        if (data4.fixtures !== undefined) {
          if (typeof data4.fixtures !== 'string') {
            const err9 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/Source/properties/fixtures/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data4.dependencyLock !== undefined) {
          if (typeof data4.dependencyLock !== 'string') {
            const err10 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/Source/properties/dependencyLock/type',
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
        if (data4.baselineRef !== undefined) {
          if (typeof data4.baselineRef !== 'string') {
            const err11 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/Source/properties/baselineRef/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/Source/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err13 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.createdAt !== undefined) {
      let data13 = data.createdAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err14 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.updatedAt !== undefined) {
      let data14 = data.updatedAt;
      if (typeof data14 === 'string') {
        if (!formats10.validate(data14)) {
          const err16 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
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
  validate147.errors = vErrors;
  return errors === 0;
}
validate147.evaluated = {
  props: {
    id: true,
    name: true,
    contentType: true,
    revision: true,
    source: true,
    sourceDigest: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema207 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    contentType: { type: 'string' },
    revision: { type: 'integer', format: 'int32' },
    source: { $ref: '#/components/schemas/PartialSource' },
    sourceDigest: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
const schema208 = {
  type: 'object',
  properties: {
    files: { type: 'object', additionalProperties: { type: 'string' } },
    manifest: { type: 'string' },
    configuration: { type: 'string' },
    fixtures: { type: 'string' },
    dependencyLock: { type: 'string' },
    baselineRef: { type: 'string' },
  },
};
function validate149(
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
  const evaluated0 = validate149.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.revision !== undefined) {
      let data3 = data.revision;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err4 = {
          instancePath: instancePath + '/revision',
          schemaPath: '#/properties/revision/type',
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
    if (data.source !== undefined) {
      let data4 = data.source;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.files !== undefined) {
          let data5 = data4.files;
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            for (const key0 in data5) {
              if (typeof data5[key0] !== 'string') {
                const err5 = {
                  instancePath:
                    instancePath +
                    '/source/files/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath:
                    '#/components/schemas/PartialSource/properties/files/additionalProperties/type',
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
              instancePath: instancePath + '/source/files',
              schemaPath:
                '#/components/schemas/PartialSource/properties/files/type',
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
        if (data4.manifest !== undefined) {
          if (typeof data4.manifest !== 'string') {
            const err7 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/PartialSource/properties/manifest/type',
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
        if (data4.configuration !== undefined) {
          if (typeof data4.configuration !== 'string') {
            const err8 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/PartialSource/properties/configuration/type',
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
        if (data4.fixtures !== undefined) {
          if (typeof data4.fixtures !== 'string') {
            const err9 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/PartialSource/properties/fixtures/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data4.dependencyLock !== undefined) {
          if (typeof data4.dependencyLock !== 'string') {
            const err10 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/PartialSource/properties/dependencyLock/type',
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
        if (data4.baselineRef !== undefined) {
          if (typeof data4.baselineRef !== 'string') {
            const err11 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/PartialSource/properties/baselineRef/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/PartialSource/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err13 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.createdAt !== undefined) {
      let data13 = data.createdAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err14 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.updatedAt !== undefined) {
      let data14 = data.updatedAt;
      if (typeof data14 === 'string') {
        if (!formats10.validate(data14)) {
          const err16 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
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
  validate149.errors = vErrors;
  return errors === 0;
}
validate149.evaluated = {
  props: {
    id: true,
    name: true,
    contentType: true,
    revision: true,
    source: true,
    sourceDigest: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate146(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginDevelopmentOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate146.evaluated;
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
    !validate147(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate147.errors
        : vErrors.concat(validate147.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.id = true;
    props0.name = true;
    props0.contentType = true;
    props0.revision = true;
    props0.source = true;
    props0.sourceDigest = true;
    props0.createdAt = true;
    props0.updatedAt = true;
  }
  const _errs2 = errors;
  if (
    !validate149(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate149.errors
        : vErrors.concat(validate149.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.name = true;
      props0.contentType = true;
      props0.revision = true;
      props0.source = true;
      props0.sourceDigest = true;
      props0.createdAt = true;
      props0.updatedAt = true;
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
  validate146.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate146.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewPluginDevelopmentOutputFull = validate151;
const schema209 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Development',
  $id: 'https://edition.invalid/validators/viewPluginDevelopmentOutputFull',
};
function validate152(
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
  const evaluated0 = validate152.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err2 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err3 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.revision !== undefined) {
      let data3 = data.revision;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err4 = {
          instancePath: instancePath + '/revision',
          schemaPath: '#/properties/revision/type',
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
    if (data.source !== undefined) {
      let data4 = data.source;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.files !== undefined) {
          let data5 = data4.files;
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            for (const key0 in data5) {
              if (typeof data5[key0] !== 'string') {
                const err5 = {
                  instancePath:
                    instancePath +
                    '/source/files/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath:
                    '#/components/schemas/Source/properties/files/additionalProperties/type',
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
              instancePath: instancePath + '/source/files',
              schemaPath: '#/components/schemas/Source/properties/files/type',
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
        if (data4.manifest !== undefined) {
          if (typeof data4.manifest !== 'string') {
            const err7 = {
              instancePath: instancePath + '/source/manifest',
              schemaPath:
                '#/components/schemas/Source/properties/manifest/type',
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
        if (data4.configuration !== undefined) {
          if (typeof data4.configuration !== 'string') {
            const err8 = {
              instancePath: instancePath + '/source/configuration',
              schemaPath:
                '#/components/schemas/Source/properties/configuration/type',
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
        if (data4.fixtures !== undefined) {
          if (typeof data4.fixtures !== 'string') {
            const err9 = {
              instancePath: instancePath + '/source/fixtures',
              schemaPath:
                '#/components/schemas/Source/properties/fixtures/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data4.dependencyLock !== undefined) {
          if (typeof data4.dependencyLock !== 'string') {
            const err10 = {
              instancePath: instancePath + '/source/dependencyLock',
              schemaPath:
                '#/components/schemas/Source/properties/dependencyLock/type',
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
        if (data4.baselineRef !== undefined) {
          if (typeof data4.baselineRef !== 'string') {
            const err11 = {
              instancePath: instancePath + '/source/baselineRef',
              schemaPath:
                '#/components/schemas/Source/properties/baselineRef/type',
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
      } else {
        const err12 = {
          instancePath: instancePath + '/source',
          schemaPath: '#/components/schemas/Source/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.sourceDigest !== undefined) {
      if (typeof data.sourceDigest !== 'string') {
        const err13 = {
          instancePath: instancePath + '/sourceDigest',
          schemaPath: '#/properties/sourceDigest/type',
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
    if (data.createdAt !== undefined) {
      let data13 = data.createdAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err14 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
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
    if (data.updatedAt !== undefined) {
      let data14 = data.updatedAt;
      if (typeof data14 === 'string') {
        if (!formats10.validate(data14)) {
          const err16 = {
            instancePath: instancePath + '/updatedAt',
            schemaPath: '#/properties/updatedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/updatedAt',
          schemaPath: '#/properties/updatedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
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
  validate152.errors = vErrors;
  return errors === 0;
}
validate152.evaluated = {
  props: {
    id: true,
    name: true,
    contentType: true,
    revision: true,
    source: true,
    sourceDigest: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate151(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewPluginDevelopmentOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate151.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate152(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate152.errors
        : vErrors.concat(validate152.errors);
    errors = vErrors.length;
  }
  validate151.errors = vErrors;
  return errors === 0;
}
validate151.evaluated = {
  props: {
    id: true,
    name: true,
    contentType: true,
    revision: true,
    source: true,
    sourceDigest: true,
    createdAt: true,
    updatedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
