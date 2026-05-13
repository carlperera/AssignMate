import { expect } from 'chai';
import { getCurrentUserId, getCurrentAuthUser } from '../app/supabase/backendFunctions';

describe('AuthService', () => {
  it('should authenticate a user with valid credentials', async () => {
    const credentials = {
      email: "test@example.com",
      password: "securepassword123"
    };

    const user = await getCurrentAuthUser(credentials);

    expect(user).to.not.be.null;
    expect(user).to.have.property('id');
    expect(user!.email).to.equal(credentials.email);
    expect(user).to.have.property('name');
    expect(user).to.have.property('role');
  });

  it('should return null for invalid credentials', async () => {
    const invalidCredentials = {
      email: "nonexistent@example.com",
      password: "wrongpassword"
    };

    const user = await authenticateUser(invalidCredentials);

    expect(user).to.be.null;
  });
});