// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewContentTypeVersionInput = validate1421;
const schema1571 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        versionRef: { type: 'string' },
      },
      required: ['tenantId', 'versionRef'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewContentTypeVersionInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1421(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewContentTypeVersionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1421.evaluated;
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
        if (data0.versionRef === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'versionRef' },
            message: "must have required property '" + 'versionRef' + "'",
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
        if (data0.versionRef !== undefined) {
          if (typeof data0.versionRef !== 'string') {
            const err5 = {
              instancePath: instancePath + '/path/versionRef',
              schemaPath: '#/properties/path/properties/versionRef/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err7 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          } else {
            const err9 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err10 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1421.errors = vErrors;
  return errors === 0;
}
validate1421.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewContentTypeVersionOutput = validate1422;
const schema1572 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Version' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialVersion',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewContentTypeVersionOutput',
};
const schema818 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    digest: { type: 'string' },
    definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
    createdAt: { type: ['string', 'null'], format: 'date-time' },
  },
};
const schema813 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    version: { type: 'string' },
    label: { type: 'string' },
    format: { type: 'string' },
    mediaType: { type: 'string' },
    language: { type: 'string' },
    renderHost: { type: 'string' },
    defaultInterpretation: { type: 'object', additionalProperties: {} },
    validation: {
      oneOf: [{ $ref: '#/components/schemas/Validation' }, { type: 'null' }],
    },
    schemaResources: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
    editors: {
      type: 'array',
      items: { $ref: '#/components/schemas/Contribution' },
    },
    renderers: {
      type: 'array',
      items: { $ref: '#/components/schemas/Contribution' },
    },
  },
};
const schema814 = {
  type: 'object',
  properties: {
    encoding: { type: 'string' },
    schemaRef: { type: ['string', 'null'] },
    instanceSchemaPointer: { type: ['string', 'null'] },
  },
};
const schema815 = {
  type: 'object',
  properties: {
    pluginId: { type: 'string' },
    pluginVersion: { type: 'string' },
    contributionId: { type: 'string' },
    config: { type: 'object', additionalProperties: {} },
  },
};
function validate697(
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
  const evaluated0 = validate697.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      if (typeof data.id !== 'string') {
        const err0 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.version !== undefined) {
      if (typeof data.version !== 'string') {
        const err1 = {
          instancePath: instancePath + '/version',
          schemaPath: '#/properties/version/type',
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
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err2 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err3 = {
          instancePath: instancePath + '/format',
          schemaPath: '#/properties/format/type',
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
    if (data.mediaType !== undefined) {
      if (typeof data.mediaType !== 'string') {
        const err4 = {
          instancePath: instancePath + '/mediaType',
          schemaPath: '#/properties/mediaType/type',
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
    if (data.language !== undefined) {
      if (typeof data.language !== 'string') {
        const err5 = {
          instancePath: instancePath + '/language',
          schemaPath: '#/properties/language/type',
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
    if (data.renderHost !== undefined) {
      if (typeof data.renderHost !== 'string') {
        const err6 = {
          instancePath: instancePath + '/renderHost',
          schemaPath: '#/properties/renderHost/type',
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
    if (data.defaultInterpretation !== undefined) {
      let data7 = data.defaultInterpretation;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
      } else {
        const err7 = {
          instancePath: instancePath + '/defaultInterpretation',
          schemaPath: '#/properties/defaultInterpretation/type',
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
    if (data.validation !== undefined) {
      let data8 = data.validation;
      const _errs19 = errors;
      let valid1 = false;
      let passing0 = null;
      const _errs20 = errors;
      if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
        if (data8.encoding !== undefined) {
          if (typeof data8.encoding !== 'string') {
            const err8 = {
              instancePath: instancePath + '/validation/encoding',
              schemaPath:
                '#/components/schemas/Validation/properties/encoding/type',
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
        if (data8.schemaRef !== undefined) {
          let data10 = data8.schemaRef;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err9 = {
              instancePath: instancePath + '/validation/schemaRef',
              schemaPath:
                '#/components/schemas/Validation/properties/schemaRef/type',
              keyword: 'type',
              params: { type: schema814.properties.schemaRef.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data8.instanceSchemaPointer !== undefined) {
          let data11 = data8.instanceSchemaPointer;
          if (typeof data11 !== 'string' && data11 !== null) {
            const err10 = {
              instancePath: instancePath + '/validation/instanceSchemaPointer',
              schemaPath:
                '#/components/schemas/Validation/properties/instanceSchemaPointer/type',
              keyword: 'type',
              params: { type: schema814.properties.instanceSchemaPointer.type },
              message: 'must be string,null',
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
          instancePath: instancePath + '/validation',
          schemaPath: '#/components/schemas/Validation/type',
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
      var _valid0 = _errs20 === errors;
      if (_valid0) {
        valid1 = true;
        passing0 = 0;
        var props0 = {};
        props0.encoding = true;
        props0.schemaRef = true;
        props0.instanceSchemaPointer = true;
      }
      const _errs29 = errors;
      if (data8 !== null) {
        const err12 = {
          instancePath: instancePath + '/validation',
          schemaPath: '#/properties/validation/oneOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      var _valid0 = _errs29 === errors;
      if (_valid0 && valid1) {
        valid1 = false;
        passing0 = [passing0, 1];
      } else {
        if (_valid0) {
          valid1 = true;
          passing0 = 1;
        }
      }
      if (!valid1) {
        const err13 = {
          instancePath: instancePath + '/validation',
          schemaPath: '#/properties/validation/oneOf',
          keyword: 'oneOf',
          params: { passingSchemas: passing0 },
          message: 'must match exactly one schema in oneOf',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      } else {
        errors = _errs19;
        if (vErrors !== null) {
          if (_errs19) {
            vErrors.length = _errs19;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.schemaResources !== undefined) {
      let data12 = data.schemaResources;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        for (const key0 in data12) {
          if (typeof data12[key0] !== 'string') {
            const err14 = {
              instancePath:
                instancePath +
                '/schemaResources/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                '#/properties/schemaResources/additionalProperties/type',
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
      } else {
        const err15 = {
          instancePath: instancePath + '/schemaResources',
          schemaPath: '#/properties/schemaResources/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.editors !== undefined) {
      let data14 = data.editors;
      if (Array.isArray(data14)) {
        const len0 = data14.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data15 = data14[i0];
          if (data15 && typeof data15 == 'object' && !Array.isArray(data15)) {
            if (data15.pluginId !== undefined) {
              if (typeof data15.pluginId !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/editors/' + i0 + '/pluginId',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/pluginId/type',
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
            if (data15.pluginVersion !== undefined) {
              if (typeof data15.pluginVersion !== 'string') {
                const err17 = {
                  instancePath:
                    instancePath + '/editors/' + i0 + '/pluginVersion',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/pluginVersion/type',
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
            if (data15.contributionId !== undefined) {
              if (typeof data15.contributionId !== 'string') {
                const err18 = {
                  instancePath:
                    instancePath + '/editors/' + i0 + '/contributionId',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/contributionId/type',
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
            if (data15.config !== undefined) {
              let data19 = data15.config;
              if (
                data19 &&
                typeof data19 == 'object' &&
                !Array.isArray(data19)
              ) {
              } else {
                const err19 = {
                  instancePath: instancePath + '/editors/' + i0 + '/config',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/config/type',
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
              instancePath: instancePath + '/editors/' + i0,
              schemaPath: '#/components/schemas/Contribution/type',
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
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/editors',
          schemaPath: '#/properties/editors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.renderers !== undefined) {
      let data20 = data.renderers;
      if (Array.isArray(data20)) {
        const len1 = data20.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data21 = data20[i1];
          if (data21 && typeof data21 == 'object' && !Array.isArray(data21)) {
            if (data21.pluginId !== undefined) {
              if (typeof data21.pluginId !== 'string') {
                const err22 = {
                  instancePath: instancePath + '/renderers/' + i1 + '/pluginId',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/pluginId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err22];
                } else {
                  vErrors.push(err22);
                }
                errors++;
              }
            }
            if (data21.pluginVersion !== undefined) {
              if (typeof data21.pluginVersion !== 'string') {
                const err23 = {
                  instancePath:
                    instancePath + '/renderers/' + i1 + '/pluginVersion',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/pluginVersion/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data21.contributionId !== undefined) {
              if (typeof data21.contributionId !== 'string') {
                const err24 = {
                  instancePath:
                    instancePath + '/renderers/' + i1 + '/contributionId',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/contributionId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
            }
            if (data21.config !== undefined) {
              let data25 = data21.config;
              if (
                data25 &&
                typeof data25 == 'object' &&
                !Array.isArray(data25)
              ) {
              } else {
                const err25 = {
                  instancePath: instancePath + '/renderers/' + i1 + '/config',
                  schemaPath:
                    '#/components/schemas/Contribution/properties/config/type',
                  keyword: 'type',
                  params: { type: 'object' },
                  message: 'must be object',
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
              instancePath: instancePath + '/renderers/' + i1,
              schemaPath: '#/components/schemas/Contribution/type',
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
          instancePath: instancePath + '/renderers',
          schemaPath: '#/properties/renderers/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
  } else {
    const err28 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
    }
    errors++;
  }
  validate697.errors = vErrors;
  return errors === 0;
}
validate697.evaluated = {
  props: {
    id: true,
    version: true,
    label: true,
    format: true,
    mediaType: true,
    language: true,
    renderHost: true,
    defaultInterpretation: true,
    validation: true,
    schemaResources: true,
    editors: true,
    renderers: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const formats10 = fullFormats['date-time'];
function validate1423(
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
  const evaluated0 = validate1423.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err0 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.digest !== undefined) {
      if (typeof data.digest !== 'string') {
        const err1 = {
          instancePath: instancePath + '/digest',
          schemaPath: '#/properties/digest/type',
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
    if (data.definition !== undefined) {
      if (
        !validate697(data.definition, {
          instancePath: instancePath + '/definition',
          parentData: data,
          parentDataProperty: 'definition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate697.errors
            : vErrors.concat(validate697.errors);
        errors = vErrors.length;
      }
    }
    if (data.createdAt !== undefined) {
      let data3 = data.createdAt;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err2 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: schema818.properties.createdAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err3 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1423.errors = vErrors;
  return errors === 0;
}
validate1423.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1574 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    digest: { type: 'string' },
    definition: { $ref: '#/components/schemas/PartialContentTypeDefinition' },
    createdAt: { type: ['string', 'null'], format: 'date-time' },
  },
};
const schema1251 = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    version: { type: 'string' },
    label: { type: 'string' },
    format: { type: 'string' },
    mediaType: { type: 'string' },
    language: { type: 'string' },
    renderHost: { type: 'string' },
    defaultInterpretation: { type: 'object', additionalProperties: {} },
    validation: {
      oneOf: [{ $ref: '#/components/schemas/Validation' }, { type: 'null' }],
    },
    schemaResources: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
    editors: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialContribution' },
    },
    renderers: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialContribution' },
    },
  },
};
const schema1253 = {
  type: 'object',
  properties: {
    pluginId: { type: 'string' },
    pluginVersion: { type: 'string' },
    contributionId: { type: 'string' },
    config: { type: 'object', additionalProperties: {} },
  },
};
function validate1078(
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
  const evaluated0 = validate1078.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      if (typeof data.id !== 'string') {
        const err0 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
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
    if (data.version !== undefined) {
      if (typeof data.version !== 'string') {
        const err1 = {
          instancePath: instancePath + '/version',
          schemaPath: '#/properties/version/type',
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
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err2 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
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
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err3 = {
          instancePath: instancePath + '/format',
          schemaPath: '#/properties/format/type',
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
    if (data.mediaType !== undefined) {
      if (typeof data.mediaType !== 'string') {
        const err4 = {
          instancePath: instancePath + '/mediaType',
          schemaPath: '#/properties/mediaType/type',
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
    if (data.language !== undefined) {
      if (typeof data.language !== 'string') {
        const err5 = {
          instancePath: instancePath + '/language',
          schemaPath: '#/properties/language/type',
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
    if (data.renderHost !== undefined) {
      if (typeof data.renderHost !== 'string') {
        const err6 = {
          instancePath: instancePath + '/renderHost',
          schemaPath: '#/properties/renderHost/type',
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
    if (data.defaultInterpretation !== undefined) {
      let data7 = data.defaultInterpretation;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
      } else {
        const err7 = {
          instancePath: instancePath + '/defaultInterpretation',
          schemaPath: '#/properties/defaultInterpretation/type',
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
    if (data.validation !== undefined) {
      let data8 = data.validation;
      const _errs19 = errors;
      let valid1 = false;
      let passing0 = null;
      const _errs20 = errors;
      if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
        if (data8.encoding !== undefined) {
          if (typeof data8.encoding !== 'string') {
            const err8 = {
              instancePath: instancePath + '/validation/encoding',
              schemaPath:
                '#/components/schemas/Validation/properties/encoding/type',
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
        if (data8.schemaRef !== undefined) {
          let data10 = data8.schemaRef;
          if (typeof data10 !== 'string' && data10 !== null) {
            const err9 = {
              instancePath: instancePath + '/validation/schemaRef',
              schemaPath:
                '#/components/schemas/Validation/properties/schemaRef/type',
              keyword: 'type',
              params: { type: schema814.properties.schemaRef.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data8.instanceSchemaPointer !== undefined) {
          let data11 = data8.instanceSchemaPointer;
          if (typeof data11 !== 'string' && data11 !== null) {
            const err10 = {
              instancePath: instancePath + '/validation/instanceSchemaPointer',
              schemaPath:
                '#/components/schemas/Validation/properties/instanceSchemaPointer/type',
              keyword: 'type',
              params: { type: schema814.properties.instanceSchemaPointer.type },
              message: 'must be string,null',
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
          instancePath: instancePath + '/validation',
          schemaPath: '#/components/schemas/Validation/type',
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
      var _valid0 = _errs20 === errors;
      if (_valid0) {
        valid1 = true;
        passing0 = 0;
        var props0 = {};
        props0.encoding = true;
        props0.schemaRef = true;
        props0.instanceSchemaPointer = true;
      }
      const _errs29 = errors;
      if (data8 !== null) {
        const err12 = {
          instancePath: instancePath + '/validation',
          schemaPath: '#/properties/validation/oneOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      var _valid0 = _errs29 === errors;
      if (_valid0 && valid1) {
        valid1 = false;
        passing0 = [passing0, 1];
      } else {
        if (_valid0) {
          valid1 = true;
          passing0 = 1;
        }
      }
      if (!valid1) {
        const err13 = {
          instancePath: instancePath + '/validation',
          schemaPath: '#/properties/validation/oneOf',
          keyword: 'oneOf',
          params: { passingSchemas: passing0 },
          message: 'must match exactly one schema in oneOf',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      } else {
        errors = _errs19;
        if (vErrors !== null) {
          if (_errs19) {
            vErrors.length = _errs19;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.schemaResources !== undefined) {
      let data12 = data.schemaResources;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        for (const key0 in data12) {
          if (typeof data12[key0] !== 'string') {
            const err14 = {
              instancePath:
                instancePath +
                '/schemaResources/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                '#/properties/schemaResources/additionalProperties/type',
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
      } else {
        const err15 = {
          instancePath: instancePath + '/schemaResources',
          schemaPath: '#/properties/schemaResources/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
    if (data.editors !== undefined) {
      let data14 = data.editors;
      if (Array.isArray(data14)) {
        const len0 = data14.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data15 = data14[i0];
          if (data15 && typeof data15 == 'object' && !Array.isArray(data15)) {
            if (data15.pluginId !== undefined) {
              if (typeof data15.pluginId !== 'string') {
                const err16 = {
                  instancePath: instancePath + '/editors/' + i0 + '/pluginId',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/pluginId/type',
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
            if (data15.pluginVersion !== undefined) {
              if (typeof data15.pluginVersion !== 'string') {
                const err17 = {
                  instancePath:
                    instancePath + '/editors/' + i0 + '/pluginVersion',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/pluginVersion/type',
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
            if (data15.contributionId !== undefined) {
              if (typeof data15.contributionId !== 'string') {
                const err18 = {
                  instancePath:
                    instancePath + '/editors/' + i0 + '/contributionId',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/contributionId/type',
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
            if (data15.config !== undefined) {
              let data19 = data15.config;
              if (
                data19 &&
                typeof data19 == 'object' &&
                !Array.isArray(data19)
              ) {
              } else {
                const err19 = {
                  instancePath: instancePath + '/editors/' + i0 + '/config',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/config/type',
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
              instancePath: instancePath + '/editors/' + i0,
              schemaPath: '#/components/schemas/PartialContribution/type',
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
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/editors',
          schemaPath: '#/properties/editors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.renderers !== undefined) {
      let data20 = data.renderers;
      if (Array.isArray(data20)) {
        const len1 = data20.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data21 = data20[i1];
          if (data21 && typeof data21 == 'object' && !Array.isArray(data21)) {
            if (data21.pluginId !== undefined) {
              if (typeof data21.pluginId !== 'string') {
                const err22 = {
                  instancePath: instancePath + '/renderers/' + i1 + '/pluginId',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/pluginId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err22];
                } else {
                  vErrors.push(err22);
                }
                errors++;
              }
            }
            if (data21.pluginVersion !== undefined) {
              if (typeof data21.pluginVersion !== 'string') {
                const err23 = {
                  instancePath:
                    instancePath + '/renderers/' + i1 + '/pluginVersion',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/pluginVersion/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data21.contributionId !== undefined) {
              if (typeof data21.contributionId !== 'string') {
                const err24 = {
                  instancePath:
                    instancePath + '/renderers/' + i1 + '/contributionId',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/contributionId/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
            }
            if (data21.config !== undefined) {
              let data25 = data21.config;
              if (
                data25 &&
                typeof data25 == 'object' &&
                !Array.isArray(data25)
              ) {
              } else {
                const err25 = {
                  instancePath: instancePath + '/renderers/' + i1 + '/config',
                  schemaPath:
                    '#/components/schemas/PartialContribution/properties/config/type',
                  keyword: 'type',
                  params: { type: 'object' },
                  message: 'must be object',
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
              instancePath: instancePath + '/renderers/' + i1,
              schemaPath: '#/components/schemas/PartialContribution/type',
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
          instancePath: instancePath + '/renderers',
          schemaPath: '#/properties/renderers/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
  } else {
    const err28 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
    }
    errors++;
  }
  validate1078.errors = vErrors;
  return errors === 0;
}
validate1078.evaluated = {
  props: {
    id: true,
    version: true,
    label: true,
    format: true,
    mediaType: true,
    language: true,
    renderHost: true,
    defaultInterpretation: true,
    validation: true,
    schemaResources: true,
    editors: true,
    renderers: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1426(
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
  const evaluated0 = validate1426.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err0 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.digest !== undefined) {
      if (typeof data.digest !== 'string') {
        const err1 = {
          instancePath: instancePath + '/digest',
          schemaPath: '#/properties/digest/type',
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
    if (data.definition !== undefined) {
      if (
        !validate1078(data.definition, {
          instancePath: instancePath + '/definition',
          parentData: data,
          parentDataProperty: 'definition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1078.errors
            : vErrors.concat(validate1078.errors);
        errors = vErrors.length;
      }
    }
    if (data.createdAt !== undefined) {
      let data3 = data.createdAt;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err2 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: schema1574.properties.createdAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err3 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1426.errors = vErrors;
  return errors === 0;
}
validate1426.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1422(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewContentTypeVersionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1422.evaluated;
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
    !validate1423(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1423.errors
        : vErrors.concat(validate1423.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.versionRef = true;
    props0.digest = true;
    props0.definition = true;
    props0.createdAt = true;
  }
  const _errs2 = errors;
  if (
    !validate1426(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1426.errors
        : vErrors.concat(validate1426.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.versionRef = true;
      props0.digest = true;
      props0.definition = true;
      props0.createdAt = true;
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
  validate1422.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1422.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewContentTypeVersionOutputFull = validate1429;
const schema1575 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Version',
  $id: 'https://edition.invalid/validators/viewContentTypeVersionOutputFull',
};
function validate1430(
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
  const evaluated0 = validate1430.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err0 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.digest !== undefined) {
      if (typeof data.digest !== 'string') {
        const err1 = {
          instancePath: instancePath + '/digest',
          schemaPath: '#/properties/digest/type',
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
    if (data.definition !== undefined) {
      if (
        !validate697(data.definition, {
          instancePath: instancePath + '/definition',
          parentData: data,
          parentDataProperty: 'definition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate697.errors
            : vErrors.concat(validate697.errors);
        errors = vErrors.length;
      }
    }
    if (data.createdAt !== undefined) {
      let data3 = data.createdAt;
      if (typeof data3 !== 'string' && data3 !== null) {
        const err2 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: schema818.properties.createdAt.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err3 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1430.errors = vErrors;
  return errors === 0;
}
validate1430.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1429(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewContentTypeVersionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1429.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1430(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1430.errors
        : vErrors.concat(validate1430.errors);
    errors = vErrors.length;
  }
  validate1429.errors = vErrors;
  return errors === 0;
}
validate1429.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
