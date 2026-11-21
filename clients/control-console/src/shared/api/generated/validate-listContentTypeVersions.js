// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listContentTypeVersionsInput = validate686;
const schema802 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    query: {
      type: 'object',
      properties: {
        contentType: { type: 'string' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['contentType'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/listContentTypeVersionsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate686(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypeVersionsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate686.evaluated;
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
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
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
        if (data2.contentType === undefined) {
          const err6 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'contentType' },
            message: "must have required property '" + 'contentType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data2.contentType !== undefined) {
          if (typeof data2.contentType !== 'string') {
            const err7 = {
              instancePath: instancePath + '/query/contentType',
              schemaPath: '#/properties/query/properties/contentType/type',
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
        if (data2.fields !== undefined) {
          let data4 = data2.fields;
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
  validate686.errors = vErrors;
  return errors === 0;
}
validate686.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listContentTypeVersionsOutput = validate687;
const schema803 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/VersionList' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialVersionList',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listContentTypeVersionsOutput',
};
const schema804 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/VersionSummary' },
    },
  },
};
const schema805 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    contentType: { type: 'string' },
    version: { type: 'string' },
    digest: { type: 'string' },
    createdAt: { type: ['string', 'null'], format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate688(
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
  const evaluated0 = validate688.evaluated;
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/versionRef/type',
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
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/contentType/type',
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
                    '#/components/schemas/VersionSummary/properties/version/type',
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
            if (data1.digest !== undefined) {
              if (typeof data1.digest !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/digest',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/digest/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: schema805.properties.createdAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/VersionSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
          } else {
            const err6 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/VersionSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
  validate688.errors = vErrors;
  return errors === 0;
}
validate688.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema806 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialVersionSummary' },
    },
  },
};
const schema807 = {
  type: 'object',
  properties: {
    versionRef: { type: 'string' },
    contentType: { type: 'string' },
    version: { type: 'string' },
    digest: { type: 'string' },
    createdAt: { type: ['string', 'null'], format: 'date-time' },
  },
};
function validate690(
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
  const evaluated0 = validate690.evaluated;
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/PartialVersionSummary/properties/versionRef/type',
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
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PartialVersionSummary/properties/contentType/type',
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
                    '#/components/schemas/PartialVersionSummary/properties/version/type',
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
            if (data1.digest !== undefined) {
              if (typeof data1.digest !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/digest',
                  schemaPath:
                    '#/components/schemas/PartialVersionSummary/properties/digest/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialVersionSummary/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: schema807.properties.createdAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialVersionSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
          } else {
            const err6 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialVersionSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
  validate690.errors = vErrors;
  return errors === 0;
}
validate690.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate687(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypeVersionsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate687.evaluated;
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
    !validate688(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate688.errors
        : vErrors.concat(validate688.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
  }
  const _errs2 = errors;
  if (
    !validate690(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate690.errors
        : vErrors.concat(validate690.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
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
  validate687.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate687.evaluated = { dynamicProps: true, dynamicItems: false };
export const listContentTypeVersionsOutputFull = validate692;
const schema808 = {
  $ref: 'https://edition.invalid/control#/components/schemas/VersionList',
  $id: 'https://edition.invalid/validators/listContentTypeVersionsOutputFull',
};
function validate693(
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
  const evaluated0 = validate693.evaluated;
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
            if (data1.versionRef !== undefined) {
              if (typeof data1.versionRef !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/versionRef',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/versionRef/type',
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
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/contentType/type',
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
                    '#/components/schemas/VersionSummary/properties/version/type',
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
            if (data1.digest !== undefined) {
              if (typeof data1.digest !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/items/' + i0 + '/digest',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/digest/type',
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
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 !== 'string' && data6 !== null) {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/VersionSummary/properties/createdAt/type',
                  keyword: 'type',
                  params: { type: schema805.properties.createdAt.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath: instancePath + '/items/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/VersionSummary/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
          } else {
            const err6 = {
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/VersionSummary/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
  validate693.errors = vErrors;
  return errors === 0;
}
validate693.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate692(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypeVersionsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate692.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate693(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate693.errors
        : vErrors.concat(validate693.errors);
    errors = vErrors.length;
  }
  validate692.errors = vErrors;
  return errors === 0;
}
validate692.evaluated = {
  props: { items: true },
  dynamicProps: false,
  dynamicItems: false,
};
