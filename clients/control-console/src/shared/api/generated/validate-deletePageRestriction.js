// Generated from contracts/openapi.json. Do not edit.
'use strict';
export const deletePageRestrictionInput = validate77;
const schema102 = {
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
    header: {
      type: 'object',
      properties: { 'If-Match': { type: 'string' } },
      required: ['If-Match'],
    },
  },
  required: ['path', 'header'],
  $id: 'https://edition.invalid/validators/deletePageRestrictionInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate77(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deletePageRestrictionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate77.evaluated;
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
    if (data.header !== undefined) {
      let data4 = data.header;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4['If-Match'] === undefined) {
          const err12 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'If-Match' },
            message: "must have required property '" + 'If-Match' + "'",
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data4['If-Match'] !== undefined) {
          if (typeof data4['If-Match'] !== 'string') {
            const err13 = {
              instancePath: instancePath + '/header/If-Match',
              schemaPath: '#/properties/header/properties/If-Match/type',
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
      } else {
        const err14 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
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
  validate77.errors = vErrors;
  return errors === 0;
}
validate77.evaluated = {
  props: { path: true, header: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const deletePageRestrictionOutput = validate78;
const schema103 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PagePermissionView',
  $id: 'https://edition.invalid/validators/deletePageRestrictionOutput',
};
const schema97 = {
  type: 'object',
  properties: {
    pageId: { type: 'string', format: 'uuid' },
    restriction: { $ref: '#/components/schemas/RestrictionView' },
    allowedActions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'grant',
          'override',
          'set_none',
          'change_role',
          'revoke',
          'explain',
          'restrict',
          'replace_restriction',
          'narrow_restriction',
          'unrestrict',
        ],
      },
    },
  },
};
const schema98 = {
  type: 'object',
  properties: {
    active: { type: 'boolean' },
    principals: {
      type: 'array',
      items: { $ref: '#/components/schemas/PrincipalView' },
    },
    revision: { type: 'integer', format: 'int64' },
  },
};
const schema51 = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    type: { type: 'string' },
    id: { type: ['string', 'null'], format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    email: { type: ['string', 'null'] },
    avatar: { type: ['string', 'null'] },
    memberCount: { type: ['integer', 'null'], format: 'int64' },
  },
};
function validate70(
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
  const evaluated0 = validate70.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.active !== undefined) {
      if (typeof data.active !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/active',
          schemaPath: '#/properties/active/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.principals !== undefined) {
      let data1 = data.principals;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            if (data2.key !== undefined) {
              if (typeof data2.key !== 'string') {
                const err1 = {
                  instancePath: instancePath + '/principals/' + i0 + '/key',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/key/type',
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
            if (data2.type !== undefined) {
              if (typeof data2.type !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/principals/' + i0 + '/type',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/type/type',
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
            if (data2.id !== undefined) {
              let data5 = data2.id;
              if (typeof data5 !== 'string' && data5 !== null) {
                const err3 = {
                  instancePath: instancePath + '/principals/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/id/type',
                  keyword: 'type',
                  params: { type: schema51.properties.id.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err4 = {
                    instancePath: instancePath + '/principals/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PrincipalView/properties/id/format',
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
              }
            }
            if (data2.name !== undefined) {
              if (typeof data2.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/principals/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/name/type',
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
            if (data2.status !== undefined) {
              if (typeof data2.status !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/principals/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/status/type',
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
            if (data2.email !== undefined) {
              let data8 = data2.email;
              if (typeof data8 !== 'string' && data8 !== null) {
                const err7 = {
                  instancePath: instancePath + '/principals/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/email/type',
                  keyword: 'type',
                  params: { type: schema51.properties.email.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
            if (data2.avatar !== undefined) {
              let data9 = data2.avatar;
              if (typeof data9 !== 'string' && data9 !== null) {
                const err8 = {
                  instancePath: instancePath + '/principals/' + i0 + '/avatar',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/avatar/type',
                  keyword: 'type',
                  params: { type: schema51.properties.avatar.type },
                  message: 'must be string,null',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (data2.memberCount !== undefined) {
              let data10 = data2.memberCount;
              if (
                !(
                  typeof data10 == 'number' &&
                  !(data10 % 1) &&
                  !isNaN(data10)
                ) &&
                data10 !== null
              ) {
                const err9 = {
                  instancePath:
                    instancePath + '/principals/' + i0 + '/memberCount',
                  schemaPath:
                    '#/components/schemas/PrincipalView/properties/memberCount/type',
                  keyword: 'type',
                  params: { type: schema51.properties.memberCount.type },
                  message: 'must be integer,null',
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
              instancePath: instancePath + '/principals/' + i0,
              schemaPath: '#/components/schemas/PrincipalView/type',
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
          instancePath: instancePath + '/principals',
          schemaPath: '#/properties/principals/type',
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
    if (data.revision !== undefined) {
      let data11 = data.revision;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err12 = {
          instancePath: instancePath + '/revision',
          schemaPath: '#/properties/revision/type',
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
  validate70.errors = vErrors;
  return errors === 0;
}
validate70.evaluated = {
  props: { active: true, principals: true, revision: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate79(
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
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pageId !== undefined) {
      let data0 = data.pageId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/pageId',
            schemaPath: '#/properties/pageId/format',
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
          instancePath: instancePath + '/pageId',
          schemaPath: '#/properties/pageId/type',
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
    if (data.restriction !== undefined) {
      if (
        !validate70(data.restriction, {
          instancePath: instancePath + '/restriction',
          parentData: data,
          parentDataProperty: 'restriction',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate70.errors
            : vErrors.concat(validate70.errors);
        errors = vErrors.length;
      }
    }
    if (data.allowedActions !== undefined) {
      let data2 = data.allowedActions;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (typeof data3 !== 'string') {
            const err2 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data3 === 'grant' ||
            data3 === 'override' ||
            data3 === 'set_none' ||
            data3 === 'change_role' ||
            data3 === 'revoke' ||
            data3 === 'explain' ||
            data3 === 'restrict' ||
            data3 === 'replace_restriction' ||
            data3 === 'narrow_restriction' ||
            data3 === 'unrestrict'
          )) {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema97.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/type',
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
  validate79.errors = vErrors;
  return errors === 0;
}
validate79.evaluated = {
  props: { pageId: true, restriction: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate78(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deletePageRestrictionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate78.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate79(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  validate78.errors = vErrors;
  return errors === 0;
}
validate78.evaluated = {
  props: { pageId: true, restriction: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const deletePageRestrictionOutputFull = validate82;
const schema105 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PagePermissionView',
  $id: 'https://edition.invalid/validators/deletePageRestrictionOutputFull',
};
function validate83(
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
  const evaluated0 = validate83.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.pageId !== undefined) {
      let data0 = data.pageId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/pageId',
            schemaPath: '#/properties/pageId/format',
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
          instancePath: instancePath + '/pageId',
          schemaPath: '#/properties/pageId/type',
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
    if (data.restriction !== undefined) {
      if (
        !validate70(data.restriction, {
          instancePath: instancePath + '/restriction',
          parentData: data,
          parentDataProperty: 'restriction',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate70.errors
            : vErrors.concat(validate70.errors);
        errors = vErrors.length;
      }
    }
    if (data.allowedActions !== undefined) {
      let data2 = data.allowedActions;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (typeof data3 !== 'string') {
            const err2 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/type',
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
          if (!(
            data3 === 'grant' ||
            data3 === 'override' ||
            data3 === 'set_none' ||
            data3 === 'change_role' ||
            data3 === 'revoke' ||
            data3 === 'explain' ||
            data3 === 'restrict' ||
            data3 === 'replace_restriction' ||
            data3 === 'narrow_restriction' ||
            data3 === 'unrestrict'
          )) {
            const err3 = {
              instancePath: instancePath + '/allowedActions/' + i0,
              schemaPath: '#/properties/allowedActions/items/enum',
              keyword: 'enum',
              params: {
                allowedValues: schema97.properties.allowedActions.items.enum,
              },
              message: 'must be equal to one of the allowed values',
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
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/type',
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
  validate83.errors = vErrors;
  return errors === 0;
}
validate83.evaluated = {
  props: { pageId: true, restriction: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate82(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deletePageRestrictionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate82.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate83(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
    errors = vErrors.length;
  }
  validate82.errors = vErrors;
  return errors === 0;
}
validate82.evaluated = {
  props: { pageId: true, restriction: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
