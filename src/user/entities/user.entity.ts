import { Exclude, classToPlain } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';
import {
  Entity,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  AfterLoad,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  family: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ unique: true, nullable: true })
  @MaxLength(11)
  mobile: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 0, type: 'float', precision: 10, scale: 2 })
  @Exclude()
  balance: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ default: null, nullable: true })
  avatar: string | null;

  @Column({ default: false })
  is_admin: boolean;

  @Column({ default: false })
  @Exclude()
  is_blocked: boolean;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  @Exclude()
  email_verified_at: Date;

  @Column({ nullable: true })
  @Exclude()
  mobile_verified_at: Date;

  @CreateDateColumn()
  @Exclude()
  created_at: Date;

  @UpdateDateColumn()
  @Exclude()
  updated_at: Date;

  toJSON() {
    return classToPlain(this);
  }

  get fullName() {
    return `${this.name} ${this.family}`;
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  @BeforeInsert()
  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @Exclude()
  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private async encryptPassword(): Promise<void> {
    if (this.tempPassword !== this.password) {
      await this.hashPassword();
    }
  }
}
