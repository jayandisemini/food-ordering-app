import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/localization/language_provider.dart';
import 'presentation/navigation/auth_wrapper.dart';
import 'state/cart_provider.dart';

const _supabaseUrl = 'https://jkuqaajnlftacqqanhep.supabase.co';
const _supabaseAnonKey = 'sb_publishable_4V8vSW6_K8okyM-VWrDXww_kxI9JzjV';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: _supabaseUrl,
    publishableKey: _supabaseAnonKey,
  );

  runApp(const QuickBiteApp());
}

class QuickBiteApp extends StatelessWidget {
  const QuickBiteApp({super.key, this.home});

  final Widget? home;

  @override
  Widget build(BuildContext context) {
<<<<<<< HEAD
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        title: 'FoodieGo',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF121212),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFFF6B2C),
            brightness: Brightness.dark,
            primary: const Color(0xFFFF6B2C),
            surface: const Color(0xFF1B1B1B),
          ),
          navigationBarTheme: const NavigationBarThemeData(
            labelTextStyle: WidgetStatePropertyAll(
              TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
            ),
          ),
          snackBarTheme: const SnackBarThemeData(
            behavior: SnackBarBehavior.floating,
          ),
        ),
        home: home ?? const AuthWrapper(),
=======
    return const MaterialApp(
      title: 'Orders',
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _future = Supabase.instance.client.from('orders').select();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red)));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('No data found'));
          }
          
          final orders = snapshot.data!;
          if (orders.isEmpty) {
            return const Center(child: Text('No orders found'));
          }

          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: ((context, index) {
              final order = orders[index];
              return ListTile(
                title: Text(order['food_name']?.toString() ?? 'Unknown item'),
                subtitle: Text('Status: ${order['status'] ?? 'Pending'}'),
              );
            }),
          );
        },
>>>>>>> cb2f3bbe333c55755cdfb2ac6057d290d23cf917
      ),
    );
  }
}
