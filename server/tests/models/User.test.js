import mongoose from 'mongoose';
import User from '../../models/User.js';

describe('User Model', () => {
  describe('User creation', () => {
    it('should create a new user with valid data', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(user._id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).not.toBe('password123'); // Password should be hashed
    });

    it('should require email field', async () => {
      try {
        await User.create({
          password: 'password123',
          name: 'Test User',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('email');
      }
    });

    it('should require password field', async () => {
      try {
        await User.create({
          email: 'test@example.com',
          name: 'Test User',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('password');
      }
    });

    it('should require name field', async () => {
      try {
        await User.create({
          email: 'test@example.com',
          password: 'password123',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('name');
      }
    });

    it('should enforce unique email constraint', async () => {
      await User.create({
        email: 'unique@example.com',
        password: 'password123',
        name: 'First User',
      });

      try {
        await User.create({
          email: 'unique@example.com',
          password: 'different-password',
          name: 'Second User',
        });
        fail('Should have thrown a duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error code
      }
    });

    it('should lowercase email before saving', async () => {
      const user = await User.create({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        name: 'Test User',
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should trim email before saving', async () => {
      const user = await User.create({
        email: '  test@example.com  ',
        password: 'password123',
        name: 'Test User',
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should set timestamps on creation', async () => {
      const user = await User.create({
        email: 'timestamp@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'mySecretPassword123';
      const user = await User.create({
        email: 'hash@example.com',
        password: plainPassword,
        name: 'Hash Test User',
      });

      expect(user.password).not.toBe(plainPassword);

      // Retrieve from DB to ensure hash was persisted
      const retrievedUser = await User.findById(user._id);
      expect(retrievedUser.password).not.toBe(plainPassword);
      expect(retrievedUser.password.length).toBeGreaterThan(plainPassword.length);
    });

    it('should hash password consistently for same input (different each time)', async () => {
      const password = 'testpassword';

      const user1 = await User.create({
        email: 'user1@example.com',
        password: password,
        name: 'User 1',
      });

      const user2 = await User.create({
        email: 'user2@example.com',
        password: password,
        name: 'User 2',
      });

      // Both passwords are hashed, but should be different hashes
      expect(user1.password).not.toBe(user2.password);
    });

    it('should not re-hash password on update if password is not modified', async () => {
      const user = await User.create({
        email: 'update@example.com',
        password: 'password123',
        name: 'Update Test',
      });

      const originalHash = user.password;

      // Update name without changing password
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    it('should hash new password if password is modified', async () => {
      const user = await User.create({
        email: 'modify@example.com',
        password: 'oldpassword',
        name: 'Modify Test',
      });

      const originalHash = user.password;

      // Update password
      user.password = 'newpassword';
      await user.save();

      expect(user.password).not.toBe(originalHash);
      expect(user.password).not.toBe('newpassword');
    });
  });

  describe('comparePassword method', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'correctPassword123';
      const user = await User.create({
        email: 'compare@example.com',
        password: plainPassword,
        name: 'Compare Test',
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'compare2@example.com',
        password: 'correctPassword',
        name: 'Compare Test 2',
      });

      const isMatch = await user.comparePassword('wrongPassword');
      expect(isMatch).toBe(false);
    });

    it('should handle password comparison case-sensitively', async () => {
      const user = await User.create({
        email: 'casesensitive@example.com',
        password: 'MyPassword123',
        name: 'Case Sensitive Test',
      });

      const correctMatch = await user.comparePassword('MyPassword123');
      const wrongCaseMatch = await user.comparePassword('mypassword123');

      expect(correctMatch).toBe(true);
      expect(wrongCaseMatch).toBe(false);
    });

    it('should work with special characters in password', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const user = await User.create({
        email: 'special@example.com',
        password: specialPassword,
        name: 'Special Char Test',
      });

      const isMatch = await user.comparePassword(specialPassword);
      expect(isMatch).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const user = await User.create({
        email: 'longpass@example.com',
        password: longPassword,
        name: 'Long Password Test',
      });

      const isMatch = await user.comparePassword(longPassword);
      expect(isMatch).toBe(true);
    });
  });

  describe('Email validation', () => {
    it('should accept valid email addresses', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com',
      ];

      for (const email of validEmails) {
        const user = await User.create({
          email: email,
          password: 'password123',
          name: 'Test User',
        });
        expect(user.email).toBeDefined();
      }
    });

    it('should store only one email for each unique lowercased email', async () => {
      await User.create({
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'User 1',
      });

      try {
        await User.create({
          email: 'DUPLICATE@EXAMPLE.COM',
          password: 'password456',
          name: 'User 2',
        });
        fail('Should have thrown a duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000);
      }
    });
  });

  describe('User retrieval', () => {
    it('should find user by email', async () => {
      const created = await User.create({
        email: 'findme@example.com',
        password: 'password123',
        name: 'Find Me',
      });

      const found = await User.findOne({ email: 'findme@example.com' });
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.name).toBe('Find Me');
    });

    it('should find user by ID', async () => {
      const created = await User.create({
        email: 'findbyid@example.com',
        password: 'password123',
        name: 'Find By ID',
      });

      const found = await User.findById(created._id);
      expect(found.email).toBe('findbyid@example.com');
    });

    it('should not find user with non-existent email', async () => {
      const found = await User.findOne({ email: 'nonexistent@example.com' });
      expect(found).toBeNull();
    });
  });
});
