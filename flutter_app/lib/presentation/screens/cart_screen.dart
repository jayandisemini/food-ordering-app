import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/localization/language_provider.dart';
import '../../data/food_data.dart';
import '../../state/cart_provider.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _promo = TextEditingController();
  bool _placing = false;

  @override
  void dispose() {
    _promo.dispose();
    super.dispose();
  }

  Future<void> _place() async {
    setState(() => _placing = true);
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;
    final cart = context.read<CartProvider>();
    final lang = context.read<LanguageProvider>();
    cart.clear();
    setState(() => _placing = false);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(lang.t('cart.placed')),
      backgroundColor: Colors.green,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final cart = context.watch<CartProvider>();
    final currency = lang.t('common.currency');

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121212),
        elevation: 0,
        title: Text(lang.t('cart.title'), style: const TextStyle(fontWeight: FontWeight.w900)),
        centerTitle: true,
      ),
      body: cart.items.isEmpty
          ? Center(child: Text(lang.t('cart.empty'), style: const TextStyle(color: Colors.white54)))
          : Column(children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) {
                    final ci = cart.items[i];
                    final f = foods.firstWhere((x) => x.id == ci.id);
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: const Color(0xFF1B1B1B), borderRadius: BorderRadius.circular(18)),
                      child: Row(children: [
                        Container(
                          height: 56, width: 56, alignment: Alignment.center,
                          decoration: BoxDecoration(color: const Color(0xFF252525), borderRadius: BorderRadius.circular(14)),
                          child: Text(f.emoji, style: const TextStyle(fontSize: 28)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(f.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Text(formatLkr(f.price, currency),
                              style: const TextStyle(color: Color(0xFFFF6B2C), fontWeight: FontWeight.w800)),
                        ])),
                        _qtyBtn(Icons.remove, () => cart.setQty(ci.id, ci.qty - 1)),
                        Padding(padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text('${ci.qty}', style: const TextStyle(fontWeight: FontWeight.w800))),
                        _qtyBtn(Icons.add, () => cart.setQty(ci.id, ci.qty + 1)),
                      ]),
                    );
                  },
                ),
              ),
              _summary(cart, lang, currency),
            ]),
    );
  }

  Widget _qtyBtn(IconData i, VoidCallback onTap) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          height: 28, width: 28, alignment: Alignment.center,
          decoration: BoxDecoration(color: const Color(0xFF252525), borderRadius: BorderRadius.circular(10)),
          child: Icon(i, size: 14),
        ),
      );

  Widget _summary(CartProvider cart, LanguageProvider lang, String c) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Color(0xFF1B1B1B),
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(children: [
              Expanded(child: TextField(
                controller: _promo,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: lang.t('cart.promo'),
                  hintStyle: const TextStyle(color: Colors.white38),
                  filled: true, fillColor: const Color(0xFF252525),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
              )),
              const SizedBox(width: 8),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF6B2C), foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final ok = cart.applyPromo(_promo.text);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(ok ? '✓ Promo applied' : '✗ Invalid code'),
                    backgroundColor: ok ? Colors.green : Colors.red,
                  ));
                },
                child: Text(lang.t('cart.apply')),
              ),
            ]),
            const SizedBox(height: 16),
            _row(lang.t('cart.subtotal'), formatLkr(cart.subtotal, c)),
            _row(lang.t('cart.delivery'), formatLkr(cart.deliveryFee, c)),
            if (cart.promoApplied)
              _row(lang.t('cart.discount'), '- ${formatLkr(cart.discount, c)}', color: Colors.green),
            const Divider(color: Color(0xFF2A2A2A), height: 24),
            _row(lang.t('cart.total'), formatLkr(cart.total, c), bold: true),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity, height: 54,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF6B2C), foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: cart.items.isEmpty || _placing ? null : _place,
                child: _placing
                    ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
                    : Text(lang.t('cart.place'), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              ),
            ),
          ]),
        ),
      );

  Widget _row(String l, String v, {bool bold = false, Color? color}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(l, style: TextStyle(color: color ?? Colors.white70, fontWeight: bold ? FontWeight.w900 : FontWeight.w500)),
          Text(v, style: TextStyle(color: color ?? Colors.white, fontWeight: bold ? FontWeight.w900 : FontWeight.w700, fontSize: bold ? 18 : 14)),
        ]),
      );
}
