// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const diffPageRevisionsInput = validate1153;
const schema1312 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
        pageId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId', 'pageId'],
    },
    query: {
      type: 'object',
      properties: {
        from: { type: 'integer', format: 'int32', minimum: 1 },
        to: { type: 'integer', format: 'int32', minimum: 1 },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['from', 'to'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/diffPageRevisionsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1153(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffPageRevisionsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1153.evaluated;
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
        if (data0.spaceId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
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
        if (data0.pageId !== undefined) {
          let data3 = data0.pageId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/path/pageId',
                schemaPath: '#/properties/path/properties/pageId/format',
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
              instancePath: instancePath + '/path/pageId',
              schemaPath: '#/properties/path/properties/pageId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data4 = data.query;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.from === undefined) {
          const err12 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'from' },
            message: "must have required property '" + 'from' + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data4.to === undefined) {
          const err13 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'to' },
            message: "must have required property '" + 'to' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.from !== undefined) {
          let data5 = data4.from;
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err14 = {
              instancePath: instancePath + '/query/from',
              schemaPath: '#/properties/query/properties/from/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data5 == 'number') {
            if (data5 < 1 || isNaN(data5)) {
              const err15 = {
                instancePath: instancePath + '/query/from',
                schemaPath: '#/properties/query/properties/from/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
          }
        }
        if (data4.to !== undefined) {
          let data6 = data4.to;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
            const err16 = {
              instancePath: instancePath + '/query/to',
              schemaPath: '#/properties/query/properties/to/type',
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
          if (typeof data6 == 'number') {
            if (data6 < 1 || isNaN(data6)) {
              const err17 = {
                instancePath: instancePath + '/query/to',
                schemaPath: '#/properties/query/properties/to/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          }
        }
        if (data4.fields !== undefined) {
          let data7 = data4.fields;
          if (typeof data7 === 'string') {
            if (func1(data7) > 4096) {
              const err18 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
            if (func1(data7) < 1) {
              const err19 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
  } else {
    const err22 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
    }
    errors++;
  }
  validate1153.errors = vErrors;
  return errors === 0;
}
validate1153.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const diffPageRevisionsOutput = validate1154;
const schema1313 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/RevisionDiff',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialRevisionDiff',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/diffPageRevisionsOutput',
};
const schema1314 = {
  type: 'object',
  properties: {
    from: { type: 'integer', format: 'int32' },
    to: { type: 'integer', format: 'int32' },
    hunks: {
      type: 'array',
      items: { $ref: '#/components/schemas/DiffHunkResponse' },
    },
  },
};
const schema1315 = {
  type: 'object',
  properties: {
    oldStart: { type: 'integer', format: 'int32' },
    oldLines: { type: 'integer', format: 'int32' },
    newStart: { type: 'integer', format: 'int32' },
    newLines: { type: 'integer', format: 'int32' },
    lines: {
      type: 'array',
      items: { $ref: '#/components/schemas/DiffLineResponse' },
    },
  },
};
const schema1316 = {
  type: 'object',
  properties: { type: { type: 'string' }, content: { type: 'string' } },
};
function validate1156(
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
  const evaluated0 = validate1156.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.oldStart !== undefined) {
      let data0 = data.oldStart;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/oldStart',
          schemaPath: '#/properties/oldStart/type',
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
    if (data.oldLines !== undefined) {
      let data1 = data.oldLines;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/oldLines',
          schemaPath: '#/properties/oldLines/type',
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
    if (data.newStart !== undefined) {
      let data2 = data.newStart;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/newStart',
          schemaPath: '#/properties/newStart/type',
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
    if (data.newLines !== undefined) {
      let data3 = data.newLines;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err3 = {
          instancePath: instancePath + '/newLines',
          schemaPath: '#/properties/newLines/type',
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
    if (data.lines !== undefined) {
      let data4 = data.lines;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.type !== undefined) {
              if (typeof data5.type !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/lines/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/DiffLineResponse/properties/type/type',
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
            if (data5.content !== undefined) {
              if (typeof data5.content !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/lines/' + i0 + '/content',
                  schemaPath:
                    '#/components/schemas/DiffLineResponse/properties/content/type',
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
              instancePath: instancePath + '/lines/' + i0,
              schemaPath: '#/components/schemas/DiffLineResponse/type',
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
          instancePath: instancePath + '/lines',
          schemaPath: '#/properties/lines/type',
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
  validate1156.errors = vErrors;
  return errors === 0;
}
validate1156.evaluated = {
  props: {
    oldStart: true,
    oldLines: true,
    newStart: true,
    newLines: true,
    lines: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1155(
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
  const evaluated0 = validate1155.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.from !== undefined) {
      let data0 = data.from;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/from',
          schemaPath: '#/properties/from/type',
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
    if (data.to !== undefined) {
      let data1 = data.to;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/to',
          schemaPath: '#/properties/to/type',
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
    if (data.hunks !== undefined) {
      let data2 = data.hunks;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1156(data2[i0], {
              instancePath: instancePath + '/hunks/' + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1156.errors
                : vErrors.concat(validate1156.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/hunks',
          schemaPath: '#/properties/hunks/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1155.errors = vErrors;
  return errors === 0;
}
validate1155.evaluated = {
  props: { from: true, to: true, hunks: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1317 = {
  type: 'object',
  properties: {
    from: { type: 'integer', format: 'int32' },
    to: { type: 'integer', format: 'int32' },
    hunks: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDiffHunkResponse' },
    },
  },
};
const schema1318 = {
  type: 'object',
  properties: {
    oldStart: { type: 'integer', format: 'int32' },
    oldLines: { type: 'integer', format: 'int32' },
    newStart: { type: 'integer', format: 'int32' },
    newLines: { type: 'integer', format: 'int32' },
    lines: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialDiffLineResponse' },
    },
  },
};
const schema1319 = {
  type: 'object',
  properties: { type: { type: 'string' }, content: { type: 'string' } },
};
function validate1160(
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
  const evaluated0 = validate1160.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.oldStart !== undefined) {
      let data0 = data.oldStart;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/oldStart',
          schemaPath: '#/properties/oldStart/type',
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
    if (data.oldLines !== undefined) {
      let data1 = data.oldLines;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/oldLines',
          schemaPath: '#/properties/oldLines/type',
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
    if (data.newStart !== undefined) {
      let data2 = data.newStart;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/newStart',
          schemaPath: '#/properties/newStart/type',
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
    if (data.newLines !== undefined) {
      let data3 = data.newLines;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err3 = {
          instancePath: instancePath + '/newLines',
          schemaPath: '#/properties/newLines/type',
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
    if (data.lines !== undefined) {
      let data4 = data.lines;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == 'object' && !Array.isArray(data5)) {
            if (data5.type !== undefined) {
              if (typeof data5.type !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/lines/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PartialDiffLineResponse/properties/type/type',
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
            if (data5.content !== undefined) {
              if (typeof data5.content !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/lines/' + i0 + '/content',
                  schemaPath:
                    '#/components/schemas/PartialDiffLineResponse/properties/content/type',
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
              instancePath: instancePath + '/lines/' + i0,
              schemaPath: '#/components/schemas/PartialDiffLineResponse/type',
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
          instancePath: instancePath + '/lines',
          schemaPath: '#/properties/lines/type',
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
  validate1160.errors = vErrors;
  return errors === 0;
}
validate1160.evaluated = {
  props: {
    oldStart: true,
    oldLines: true,
    newStart: true,
    newLines: true,
    lines: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1159(
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
  const evaluated0 = validate1159.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.from !== undefined) {
      let data0 = data.from;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/from',
          schemaPath: '#/properties/from/type',
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
    if (data.to !== undefined) {
      let data1 = data.to;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/to',
          schemaPath: '#/properties/to/type',
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
    if (data.hunks !== undefined) {
      let data2 = data.hunks;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1160(data2[i0], {
              instancePath: instancePath + '/hunks/' + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1160.errors
                : vErrors.concat(validate1160.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/hunks',
          schemaPath: '#/properties/hunks/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1159.errors = vErrors;
  return errors === 0;
}
validate1159.evaluated = {
  props: { from: true, to: true, hunks: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1154(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffPageRevisionsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1154.evaluated;
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
    !validate1155(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1155.errors
        : vErrors.concat(validate1155.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.from = true;
    props0.to = true;
    props0.hunks = true;
  }
  const _errs2 = errors;
  if (
    !validate1159(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1159.errors
        : vErrors.concat(validate1159.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.from = true;
      props0.to = true;
      props0.hunks = true;
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
  validate1154.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1154.evaluated = { dynamicProps: true, dynamicItems: false };
export const diffPageRevisionsOutputFull = validate1163;
const schema1320 = {
  $ref: 'https://edition.invalid/control#/components/schemas/RevisionDiff',
  $id: 'https://edition.invalid/validators/diffPageRevisionsOutputFull',
};
function validate1164(
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
  const evaluated0 = validate1164.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.from !== undefined) {
      let data0 = data.from;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/from',
          schemaPath: '#/properties/from/type',
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
    if (data.to !== undefined) {
      let data1 = data.to;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/to',
          schemaPath: '#/properties/to/type',
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
    if (data.hunks !== undefined) {
      let data2 = data.hunks;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1156(data2[i0], {
              instancePath: instancePath + '/hunks/' + i0,
              parentData: data2,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1156.errors
                : vErrors.concat(validate1156.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/hunks',
          schemaPath: '#/properties/hunks/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
  } else {
    const err3 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate1164.errors = vErrors;
  return errors === 0;
}
validate1164.evaluated = {
  props: { from: true, to: true, hunks: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1163(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffPageRevisionsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1163.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1164(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1164.errors
        : vErrors.concat(validate1164.errors);
    errors = vErrors.length;
  }
  validate1163.errors = vErrors;
  return errors === 0;
}
validate1163.evaluated = {
  props: { from: true, to: true, hunks: true },
  dynamicProps: false,
  dynamicItems: false,
};
