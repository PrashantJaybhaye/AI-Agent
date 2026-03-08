import OAuthButton from '@/components/clerk/components/OAuthButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top premium section */}
      <View style={[styles.topSection, { backgroundColor: '#FFF5EB' }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Siora</Text>
          <View style={styles.logoDot} />
        </View>

        <View style={styles.taglineContainer}>
          <Ionicons name="leaf-outline" size={24} color="#0000FF" style={styles.taglineIcon} />
          <Text style={styles.taglineText}>Breathe. Focus. Grow.</Text>
        </View>
      </View>

      {/* Bottom dark section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.buttonsContainer}>
          <OAuthButton strategy="oauth_google" scheme="siora">
            <View style={[styles.button, styles.primaryButton]}>
              <Ionicons name="logo-google" size={22} color="#000" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Continue with Google</Text>
            </View>
          </OAuthButton>

          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={() => router.push('/sign-up')}
          >
            <Ionicons name="mail-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.emailButtonText}>Sign up with an email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/sign-in')}
          >
            <Ionicons name="log-in-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Log in to existing account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer text */}
        {/* Footer text */}
        {/* Footer text */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerLeft}>
            <Ionicons name="document-text-outline" size={16} color="#666666" style={styles.footerIcon} />
            <Text style={styles.footerBrand}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerRight}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#666666" style={styles.footerIcon} />
            <Text style={styles.footerBrand}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5EB', // Matches the top section's cream color seamlessly
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0000FF', // Very striking blue
    letterSpacing: -1,
  },
  logoDot: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#0000FF',
    marginLeft: 4,
  },
  taglineContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  taglineIcon: {
    opacity: 0.7,
  },
  taglineText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0000FF',
    opacity: 0.7,
    letterSpacing: 1.5,
  },
  bottomSection: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 36,
    paddingHorizontal: 24,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
  },
  buttonIcon: {
    position: 'absolute',
    left: 20,
  },
  googleIconImage: {
    width: 20,
    height: 20,
    position: 'absolute',
    left: 20,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#2A2A2A',
  },
  emailButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerIcon: {
    opacity: 0.8,
  },
  footerBrand: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '500',
  },
});
