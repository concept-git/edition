// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const schema_UpdateSiteRequest = validate1580;
const schema1035 = {
  type: 'object',
  description: 'JSON Merge Patch: omitted keeps, null clears',
  properties: {
    name: { type: ['string', 'null'], maxLength: 120 },
    titleTemplate: {
      type: ['string', 'null'],
      description:
        'Contains exactly one %s placeholder; null restores the default.',
      maxLength: 120,
      pattern: '^(?:(?!%s)[\\s\\S])*%s(?:(?!%s)[\\s\\S])*$',
    },
    branding: {
      anyOf: [
        { $ref: '#/components/schemas/UpdateSiteBranding' },
        { type: 'null' },
      ],
    },
    locale: { type: ['string', 'null'] },
    analyticsId: { type: ['string', 'null'] },
    robotsPolicy: {
      type: ['string', 'null'],
      enum: ['index', 'noindex', null],
    },
    home: { type: ['string', 'null'], format: 'uuid' },
    rule: { type: ['string', 'null'] },
  },
};
const schema1036 = {
  type: 'object',
  properties: {
    logo: { type: ['string', 'null'] },
    favicon: { type: ['string', 'null'] },
    primaryColor: { type: ['string', 'null'] },
  },
};
const func1 = ucs2Length;
const pattern112 = new RegExp(
  '^(?:(?!%s)[\\s\\S])*%s(?:(?!%s)[\\s\\S])*$',
  'u',
);
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate1580(
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
  const evaluated0 = validate1580.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name !== undefined) {
      let data0 = data.name;
      if (typeof data0 !== 'string' && data0 !== null) {
        const err0 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: schema1035.properties.name.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
      if (typeof data0 === 'string') {
        if (func1(data0) > 120) {
          const err1 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 120 },
            message: 'must NOT have more than 120 characters',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      }
    }
    if (data.titleTemplate !== undefined) {
      let data1 = data.titleTemplate;
      if (typeof data1 !== 'string' && data1 !== null) {
        const err2 = {
          instancePath: instancePath + '/titleTemplate',
          schemaPath: '#/properties/titleTemplate/type',
          keyword: 'type',
          params: { type: schema1035.properties.titleTemplate.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data1 === 'string') {
        if (func1(data1) > 120) {
          const err3 = {
            instancePath: instancePath + '/titleTemplate',
            schemaPath: '#/properties/titleTemplate/maxLength',
            keyword: 'maxLength',
            params: { limit: 120 },
            message: 'must NOT have more than 120 characters',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (!pattern112.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/titleTemplate',
            schemaPath: '#/properties/titleTemplate/pattern',
            keyword: 'pattern',
            params: { pattern: '^(?:(?!%s)[\\s\\S])*%s(?:(?!%s)[\\s\\S])*$' },
            message:
              'must match pattern "' +
              '^(?:(?!%s)[\\s\\S])*%s(?:(?!%s)[\\s\\S])*$' +
              '"',
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
    if (data.branding !== undefined) {
      let data2 = data.branding;
      const _errs6 = errors;
      let valid1 = false;
      const _errs7 = errors;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.logo !== undefined) {
          let data3 = data2.logo;
          if (typeof data3 !== 'string' && data3 !== null) {
            const err5 = {
              instancePath: instancePath + '/branding/logo',
              schemaPath:
                '#/components/schemas/UpdateSiteBranding/properties/logo/type',
              keyword: 'type',
              params: { type: schema1036.properties.logo.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
        if (data2.favicon !== undefined) {
          let data4 = data2.favicon;
          if (typeof data4 !== 'string' && data4 !== null) {
            const err6 = {
              instancePath: instancePath + '/branding/favicon',
              schemaPath:
                '#/components/schemas/UpdateSiteBranding/properties/favicon/type',
              keyword: 'type',
              params: { type: schema1036.properties.favicon.type },
              message: 'must be string,null',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data2.primaryColor !== undefined) {
          let data5 = data2.primaryColor;
          if (typeof data5 !== 'string' && data5 !== null) {
            const err7 = {
              instancePath: instancePath + '/branding/primaryColor',
              schemaPath:
                '#/components/schemas/UpdateSiteBranding/properties/primaryColor/type',
              keyword: 'type',
              params: { type: schema1036.properties.primaryColor.type },
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
      } else {
        const err8 = {
          instancePath: instancePath + '/branding',
          schemaPath: '#/components/schemas/UpdateSiteBranding/type',
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
      var _valid0 = _errs7 === errors;
      valid1 = valid1 || _valid0;
      if (_valid0) {
        var props0 = {};
        props0.logo = true;
        props0.favicon = true;
        props0.primaryColor = true;
      }
      const _errs16 = errors;
      if (data2 !== null) {
        const err9 = {
          instancePath: instancePath + '/branding',
          schemaPath: '#/properties/branding/anyOf/1/type',
          keyword: 'type',
          params: { type: 'null' },
          message: 'must be null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      var _valid0 = _errs16 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err10 = {
          instancePath: instancePath + '/branding',
          schemaPath: '#/properties/branding/anyOf',
          keyword: 'anyOf',
          params: {},
          message: 'must match a schema in anyOf',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      } else {
        errors = _errs6;
        if (vErrors !== null) {
          if (_errs6) {
            vErrors.length = _errs6;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.locale !== undefined) {
      let data6 = data.locale;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err11 = {
          instancePath: instancePath + '/locale',
          schemaPath: '#/properties/locale/type',
          keyword: 'type',
          params: { type: schema1035.properties.locale.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.analyticsId !== undefined) {
      let data7 = data.analyticsId;
      if (typeof data7 !== 'string' && data7 !== null) {
        const err12 = {
          instancePath: instancePath + '/analyticsId',
          schemaPath: '#/properties/analyticsId/type',
          keyword: 'type',
          params: { type: schema1035.properties.analyticsId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.robotsPolicy !== undefined) {
      let data8 = data.robotsPolicy;
      if (typeof data8 !== 'string' && data8 !== null) {
        const err13 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/type',
          keyword: 'type',
          params: { type: schema1035.properties.robotsPolicy.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      if (!(data8 === 'index' || data8 === 'noindex' || data8 === null)) {
        const err14 = {
          instancePath: instancePath + '/robotsPolicy',
          schemaPath: '#/properties/robotsPolicy/enum',
          keyword: 'enum',
          params: { allowedValues: schema1035.properties.robotsPolicy.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.home !== undefined) {
      let data9 = data.home;
      if (typeof data9 !== 'string' && data9 !== null) {
        const err15 = {
          instancePath: instancePath + '/home',
          schemaPath: '#/properties/home/type',
          keyword: 'type',
          params: { type: schema1035.properties.home.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
      if (typeof data9 === 'string') {
        if (!formats0.test(data9)) {
          const err16 = {
            instancePath: instancePath + '/home',
            schemaPath: '#/properties/home/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      }
    }
    if (data.rule !== undefined) {
      let data10 = data.rule;
      if (typeof data10 !== 'string' && data10 !== null) {
        const err17 = {
          instancePath: instancePath + '/rule',
          schemaPath: '#/properties/rule/type',
          keyword: 'type',
          params: { type: schema1035.properties.rule.type },
          message: 'must be string,null',
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
  validate1580.errors = vErrors;
  return errors === 0;
}
validate1580.evaluated = {
  props: {
    name: true,
    titleTemplate: true,
    branding: true,
    locale: true,
    analyticsId: true,
    robotsPolicy: true,
    home: true,
    rule: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
