import { signToken, verifyToken } from '../../src/services/token';
import env from '../../src/config/env';

describe('Token Service', () => {
  const mockPayload = { client_id: 'test_client' };
  let generatedToken: string;

  it('debería firmar un token JWT correctamente', () => {
    generatedToken = signToken(mockPayload);
    
    expect(generatedToken).toBeDefined();
    expect(typeof generatedToken).toBe('string');
    expect(generatedToken.split('.').length).toBe(3); 
  });

  it('debería verificar y decodificar el token correctamente', () => {
    const decoded = verifyToken(generatedToken);
    
    expect(decoded.client_id).toBe(mockPayload.client_id);
    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
  });
});