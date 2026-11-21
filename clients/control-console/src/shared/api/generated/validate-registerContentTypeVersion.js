// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const registerContentTypeVersionInput = validate695;
const schema811 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/Register',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/registerContentTypeVersionInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const schema812 = {
  type: 'object',
  properties: {
    contentType: { type: 'string', minLength: 1 },
    baseRevision: { type: 'integer', format: 'int32', minimum: 0 },
    definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
  },
  required: ['contentType', 'definition'],
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
function validate696(
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
  const evaluated0 = validate696.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.contentType === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'contentType' },
        message: "must have required property '" + 'contentType' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.definition === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'definition' },
        message: "must have required property '" + 'definition' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.contentType !== undefined) {
      let data0 = data.contentType;
      if (typeof data0 === 'string') {
        if (func1(data0) < 1) {
          const err2 = {
            instancePath: instancePath + '/contentType',
            schemaPath: '#/properties/contentType/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters',
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
    if (data.baseRevision !== undefined) {
      let data1 = data.baseRevision;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err4 = {
          instancePath: instancePath + '/baseRevision',
          schemaPath: '#/properties/baseRevision/type',
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
      if (typeof data1 == 'number') {
        if (data1 < 0 || isNaN(data1)) {
          const err5 = {
            instancePath: instancePath + '/baseRevision',
            schemaPath: '#/properties/baseRevision/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
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
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
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
  validate696.errors = vErrors;
  return errors === 0;
}
validate696.evaluated = {
  props: { contentType: true, baseRevision: true, definition: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate695(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerContentTypeVersionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate695.evaluated;
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
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          } else {
            const err5 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
    if (data.header !== undefined) {
      let data2 = data.header;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2['Idempotency-Key'] === undefined) {
          const err7 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2['Idempotency-Key'] !== undefined) {
          let data3 = data2['Idempotency-Key'];
          if (typeof data3 === 'string') {
            if (func1(data3) > 128) {
              const err8 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
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
            if (!pattern4.test(data3)) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          } else {
            const err11 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      if (
        !validate696(data.body, {
          instancePath: instancePath + '/body',
          parentData: data,
          parentDataProperty: 'body',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate696.errors
            : vErrors.concat(validate696.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: '#/type',
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
  validate695.errors = vErrors;
  return errors === 0;
}
validate695.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const registerContentTypeVersionOutput = validate700;
const schema817 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Version',
  $id: 'https://edition.invalid/validators/registerContentTypeVersionOutput',
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
const formats10 = fullFormats['date-time'];
function validate701(
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
  const evaluated0 = validate701.evaluated;
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
  validate701.errors = vErrors;
  return errors === 0;
}
validate701.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate700(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerContentTypeVersionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate700.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate701(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate701.errors
        : vErrors.concat(validate701.errors);
    errors = vErrors.length;
  }
  validate700.errors = vErrors;
  return errors === 0;
}
validate700.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const registerContentTypeVersionOutputFull = validate704;
const schema819 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Version',
  $id: 'https://edition.invalid/validators/registerContentTypeVersionOutputFull',
};
function validate705(
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
  const evaluated0 = validate705.evaluated;
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
  validate705.errors = vErrors;
  return errors === 0;
}
validate705.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate704(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/registerContentTypeVersionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate704.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate705(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate705.errors
        : vErrors.concat(validate705.errors);
    errors = vErrors.length;
  }
  validate704.errors = vErrors;
  return errors === 0;
}
validate704.evaluated = {
  props: { versionRef: true, digest: true, definition: true, createdAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
