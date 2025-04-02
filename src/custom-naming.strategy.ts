import { AbstractNamingStrategy } from '@mikro-orm/core';

export class CustomNamingStrategy extends AbstractNamingStrategy {
  classToTableName(entityName: string): string {
    return `tbl_${entityName.toLowerCase()}`;
  }

  joinColumnName(propertyName: string): string {
    return `${propertyName}_id`;
  }

  joinKeyColumnName(entityName: string, referencedColumnName?: string): string {
    return `${entityName.toLowerCase()}_${referencedColumnName || 'id'}`;
  }

  joinTableName(
    sourceEntity: string,
    targetEntity: string,
    propertyName?: string,
  ): string {
    return `tbl_${sourceEntity.toLowerCase()}_${targetEntity.toLowerCase()}_${propertyName || 'relation'}`;
  }

  propertyToColumnName(propertyName: string): string {
    return propertyName.toLowerCase();
  }

  referenceColumnName(): string {
    return 'id';
  }
}
