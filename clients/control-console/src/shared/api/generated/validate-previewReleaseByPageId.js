// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const previewReleaseByPageIdInput = validate1086;
const schema1257 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        releaseId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'releaseId', 'pageId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/previewReleaseByPageIdInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1086(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewReleaseByPageIdInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1086.evaluated;
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
        if (data0.spaceId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.releaseId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'releaseId' },
            message: "must have required property '" + 'releaseId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.pageId === undefined) {
          const err4 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'pageId' },
            message: "must have required property '" + 'pageId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err7 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
        if (data0.releaseId !== undefined) {
          let data3 = data0.releaseId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/path/releaseId',
                schemaPath: '#/properties/path/properties/releaseId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/releaseId',
              schemaPath: '#/properties/path/properties/releaseId/type',
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
        if (data0.pageId !== undefined) {
          let data4 = data0.pageId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err11 = {
                instancePath: instancePath + '/path/pageId',
                schemaPath: '#/properties/path/properties/pageId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/path/pageId',
              schemaPath: '#/properties/path/properties/pageId/type',
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
      } else {
        const err13 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data5 = data.query;
      if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
        if (data5.fields !== undefined) {
          let data6 = data5.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
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
            if (func1(data6) < 1) {
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
  validate1086.errors = vErrors;
  return errors === 0;
}
validate1086.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const previewReleaseByPageIdOutput = validate1087;
const schema1258 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/SnapshotPreview',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialSnapshotPreview',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/previewReleaseByPageIdOutput',
};
const schema1247 = {
  type: 'object',
  properties: {
    html: { type: 'string' },
    title: { type: 'string' },
    slug: { type: 'string' },
    format: { type: 'string' },
    content: { type: 'string' },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
    contentTypeDefinition: { $ref: '#/components/schemas/ContentTypeSnapshot' },
  },
};
const schema1248 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    digest: { type: 'string' },
    definition: { $ref: '#/components/schemas/ContentTypeDefinition' },
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
function validate1072(
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
  const evaluated0 = validate1072.evaluated;
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
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate1072.errors = vErrors;
  return errors === 0;
}
validate1072.evaluated = {
  props: { versionRef: true, digest: true, definition: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1088(
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
  const evaluated0 = validate1088.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.html !== undefined) {
      if (typeof data.html !== 'string') {
        const err0 = {
          instancePath: instancePath + '/html',
          schemaPath: '#/properties/html/type',
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
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        const err1 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
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
    if (data.slug !== undefined) {
      if (typeof data.slug !== 'string') {
        const err2 = {
          instancePath: instancePath + '/slug',
          schemaPath: '#/properties/slug/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err4 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err5 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err6 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.interpretation !== undefined) {
      let data7 = data.interpretation;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
      } else {
        const err7 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
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
    if (data.contentTypeDefinition !== undefined) {
      if (
        !validate1072(data.contentTypeDefinition, {
          instancePath: instancePath + '/contentTypeDefinition',
          parentData: data,
          parentDataProperty: 'contentTypeDefinition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1072.errors
            : vErrors.concat(validate1072.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1088.errors = vErrors;
  return errors === 0;
}
validate1088.evaluated = {
  props: {
    html: true,
    title: true,
    slug: true,
    format: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
    contentTypeDefinition: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1249 = {
  type: 'object',
  properties: {
    html: { type: 'string' },
    title: { type: 'string' },
    slug: { type: 'string' },
    format: { type: 'string' },
    content: { type: 'string' },
    contentType: { type: 'string' },
    versionRef: { type: 'string' },
    interpretation: { type: 'object', additionalProperties: {} },
    contentTypeDefinition: {
      $ref: '#/components/schemas/PartialContentTypeSnapshot',
    },
  },
};
const schema1250 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    digest: { type: 'string' },
    definition: { $ref: '#/components/schemas/PartialContentTypeDefinition' },
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
function validate1077(
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
  const evaluated0 = validate1077.evaluated;
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
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate1077.errors = vErrors;
  return errors === 0;
}
validate1077.evaluated = {
  props: { versionRef: true, digest: true, definition: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1091(
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
  const evaluated0 = validate1091.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.html !== undefined) {
      if (typeof data.html !== 'string') {
        const err0 = {
          instancePath: instancePath + '/html',
          schemaPath: '#/properties/html/type',
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
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        const err1 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
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
    if (data.slug !== undefined) {
      if (typeof data.slug !== 'string') {
        const err2 = {
          instancePath: instancePath + '/slug',
          schemaPath: '#/properties/slug/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err4 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err5 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err6 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.interpretation !== undefined) {
      let data7 = data.interpretation;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
      } else {
        const err7 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
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
    if (data.contentTypeDefinition !== undefined) {
      if (
        !validate1077(data.contentTypeDefinition, {
          instancePath: instancePath + '/contentTypeDefinition',
          parentData: data,
          parentDataProperty: 'contentTypeDefinition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1077.errors
            : vErrors.concat(validate1077.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1091.errors = vErrors;
  return errors === 0;
}
validate1091.evaluated = {
  props: {
    html: true,
    title: true,
    slug: true,
    format: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
    contentTypeDefinition: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1087(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewReleaseByPageIdOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1087.evaluated;
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
    !validate1088(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1088.errors
        : vErrors.concat(validate1088.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.html = true;
    props0.title = true;
    props0.slug = true;
    props0.format = true;
    props0.content = true;
    props0.contentType = true;
    props0.versionRef = true;
    props0.interpretation = true;
    props0.contentTypeDefinition = true;
  }
  const _errs2 = errors;
  if (
    !validate1091(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1091.errors
        : vErrors.concat(validate1091.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.html = true;
      props0.title = true;
      props0.slug = true;
      props0.format = true;
      props0.content = true;
      props0.contentType = true;
      props0.versionRef = true;
      props0.interpretation = true;
      props0.contentTypeDefinition = true;
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
  validate1087.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1087.evaluated = { dynamicProps: true, dynamicItems: false };
export const previewReleaseByPageIdOutputFull = validate1094;
const schema1261 = {
  $ref: 'https://edition.invalid/control#/components/schemas/SnapshotPreview',
  $id: 'https://edition.invalid/validators/previewReleaseByPageIdOutputFull',
};
function validate1095(
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
  const evaluated0 = validate1095.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.html !== undefined) {
      if (typeof data.html !== 'string') {
        const err0 = {
          instancePath: instancePath + '/html',
          schemaPath: '#/properties/html/type',
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
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        const err1 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
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
    if (data.slug !== undefined) {
      if (typeof data.slug !== 'string') {
        const err2 = {
          instancePath: instancePath + '/slug',
          schemaPath: '#/properties/slug/type',
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
    if (data.content !== undefined) {
      if (typeof data.content !== 'string') {
        const err4 = {
          instancePath: instancePath + '/content',
          schemaPath: '#/properties/content/type',
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
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err5 = {
          instancePath: instancePath + '/contentType',
          schemaPath: '#/properties/contentType/type',
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
    if (data.versionRef !== undefined) {
      if (typeof data.versionRef !== 'string') {
        const err6 = {
          instancePath: instancePath + '/versionRef',
          schemaPath: '#/properties/versionRef/type',
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
    if (data.interpretation !== undefined) {
      let data7 = data.interpretation;
      if (data7 && typeof data7 == 'object' && !Array.isArray(data7)) {
      } else {
        const err7 = {
          instancePath: instancePath + '/interpretation',
          schemaPath: '#/properties/interpretation/type',
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
    if (data.contentTypeDefinition !== undefined) {
      if (
        !validate1072(data.contentTypeDefinition, {
          instancePath: instancePath + '/contentTypeDefinition',
          parentData: data,
          parentDataProperty: 'contentTypeDefinition',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate1072.errors
            : vErrors.concat(validate1072.errors);
        errors = vErrors.length;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1095.errors = vErrors;
  return errors === 0;
}
validate1095.evaluated = {
  props: {
    html: true,
    title: true,
    slug: true,
    format: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
    contentTypeDefinition: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1094(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewReleaseByPageIdOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1094.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1095(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1095.errors
        : vErrors.concat(validate1095.errors);
    errors = vErrors.length;
  }
  validate1094.errors = vErrors;
  return errors === 0;
}
validate1094.evaluated = {
  props: {
    html: true,
    title: true,
    slug: true,
    format: true,
    content: true,
    contentType: true,
    versionRef: true,
    interpretation: true,
    contentTypeDefinition: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
