import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";

const Stack = createNativeStackNavigator();

const initialProducts = [
  { id: "1", barcode: "869000000001", name: "Espresso Blend", category: "Kahve", unit: "kg", stock: 12.5, critical: 3 },
  { id: "2", barcode: "869000000002", name: "Barista Süt", category: "Süt", unit: "L", stock: 18.5, critical: 8 },
  { id: "3", barcode: "869000000003", name: "Vanilya Şurubu", category: "Şurup", unit: "ml", stock: 4200, critical: 1000 },
  { id: "4", barcode: "869000000004", name: "Coca-Cola 330 ml", category: "Meşrubat", unit: "adet", stock: 38, critical: 12 }
];

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [movements, setMovements] = useState([]);
  const [screen, setScreen] = useState("home");

  const critical = products.filter(p => p.stock <= p.critical);

  const addMovement = (productId, amount, type) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    ));
    const p = products.find(x => x.id === productId);
    setMovements(prev => [{
      id: Date.now().toString(),
      product: p.name,
      amount,
      unit: p.unit,
      type,
      user: "Mustafa",
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    }, ...prev]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {screen === "home" && (
          <Home products={products} critical={critical} movements={movements} onScan={() => setScreen("scan")} />
        )}
        {screen === "stock" && (
          <Stock products={products} onMove={addMovement} />
        )}
        {screen === "scan" && (
          <Scanner products={products} onMove={addMovement} onBack={() => setScreen("home")} />
        )}
        {screen === "history" && <History movements={movements} />}
        {screen === "profile" && <Profile />}
      </View>

      <View style={styles.tabbar}>
        <Tab label="Ana Sayfa" icon="⌂" active={screen === "home"} onPress={() => setScreen("home")} />
        <Tab label="Stok" icon="▣" active={screen === "stock"} onPress={() => setScreen("stock")} />
        <Pressable style={styles.scanButton} onPress={() => setScreen("scan")}>
          <Text style={styles.scanIcon}>⌕</Text>
          <Text style={styles.scanText}>TARA</Text>
        </Pressable>
        <Tab label="Hareket" icon="↕" active={screen === "history"} onPress={() => setScreen("history")} />
        <Tab label="Profil" icon="●" active={screen === "profile"} onPress={() => setScreen("profile")} />
      </View>
    </SafeAreaView>
  );
}

function Header({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>ROICO STOCK</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
    </View>
  );
}

function Home({ products, critical, movements, onScan }) {
  return (
    <FlatList
      data={[]}
      ListHeaderComponent={
        <View>
          <Header title="Günaydın Mustafa ☕" subtitle="Bugünün stok durumu" />
          <View style={styles.statsRow}>
            <Stat label="Toplam Ürün" value={products.length} />
            <Stat label="Kritik Stok" value={critical.length} danger />
          </View>

          <Pressable style={styles.bigScan} onPress={onScan}>
            <Text style={styles.bigScanIcon}>⌕</Text>
            <View>
              <Text style={styles.bigScanTitle}>BARKOD TARA</Text>
              <Text style={styles.bigScanSub}>Ürünü hızlıca bul ve işlem yap</Text>
            </View>
          </Pressable>

          <Text style={styles.section}>Kritik stoklar</Text>
          {critical.length === 0 ? (
            <Card><Text style={styles.empty}>Harika! Kritik stok yok.</Text></Card>
          ) : critical.map(p => (
            <ProductRow key={p.id} product={p} />
          ))}

          <Text style={styles.section}>Son hareketler</Text>
          {movements.length === 0 ? (
            <Card><Text style={styles.empty}>Henüz stok hareketi yok.</Text></Card>
          ) : movements.slice(0, 5).map(m => (
            <Card key={m.id}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.productName}>{m.product}</Text>
                  <Text style={styles.muted}>{m.user} • {m.time}</Text>
                </View>
                <Text style={m.amount > 0 ? styles.in : styles.out}>
                  {m.amount > 0 ? "+" : ""}{m.amount} {m.unit}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      }
      keyExtractor={() => "home"}
    />
  );
}

function Stock({ products, onMove }) {
  const [search, setSearch] = useState("");
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));

  return (
    <View style={styles.flex}>
      <Header title="Stoklar" subtitle={`${products.length} ürün kayıtlı`} />
      <TextInput
        style={styles.search}
        placeholder="Ürün veya barkod ara..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.muted}>{item.category} • {item.barcode}</Text>
                <Text style={item.stock <= item.critical ? styles.stockDanger : styles.stock}>
                  {item.stock} {item.unit}
                </Text>
              </View>
              <View>
                <Pressable style={styles.miniButton} onPress={() => onMove(item.id, 1, "Giriş")}><Text>+ Giriş</Text></Pressable>
                <Pressable style={styles.miniButton} onPress={() => onMove(item.id, -1, "Çıkış")}><Text>- Çıkış</Text></Pressable>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function Scanner({ products, onMove, onBack }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(null);

  if (!permission) return <View style={styles.center}><Text>Kamera hazırlanıyor...</Text></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Barkod Kamerası</Text>
        <Text style={styles.muted}>Barkod okutmak için kamera izni gerekli.</Text>
        <Pressable style={styles.primary} onPress={requestPermission}><Text style={styles.primaryText}>Kameraya İzin Ver</Text></Pressable>
        <Pressable onPress={onBack}><Text style={styles.back}>Geri dön</Text></Pressable>
      </View>
    );
  }

  if (scanned) {
    const p = products.find(x => x.barcode === scanned);
    return (
      <View style={styles.center}>
        <Text style={styles.scanResult}>BARKOD OKUNDU</Text>
        {p ? (
          <Card>
            <Text style={styles.productName}>{p.name}</Text>
            <Text style={styles.muted}>{p.category}</Text>
            <Text style={styles.stock}>{p.stock} {p.unit}</Text>
            <View style={styles.actionRow}>
              <Pressable style={styles.primary} onPress={() => { onMove(p.id, -1, "Çıkış"); setScanned(null); }}>
                <Text style={styles.primaryText}>-1 Çıkış</Text>
              </Pressable>
              <Pressable style={styles.secondary} onPress={() => { onMove(p.id, 1, "Giriş"); setScanned(null); }}>
                <Text>+1 Giriş</Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          <Card><Text>Bu barkod kayıtlı değil: {scanned}</Text></Card>
        )}
        <Pressable onPress={() => setScanned(null)}><Text style={styles.back}>Tekrar tara</Text></Pressable>
        <Pressable onPress={onBack}><Text style={styles.back}>Ana sayfaya dön</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"] }}
        onBarcodeScanned={({ data }) => setScanned(data)}
      />
      <View style={styles.overlay}>
        <Text style={styles.cameraTitle}>Barkodu çerçevenin içine getir</Text>
        <View style={styles.scanFrame} />
        <Pressable style={styles.cameraBack} onPress={onBack}><Text style={styles.primaryText}>Kapat</Text></Pressable>
      </View>
    </View>
  );
}

function History({ movements }) {
  return (
    <View style={styles.flex}>
      <Header title="Hareketler" subtitle="Kim, ne yaptı?" />
      <FlatList
        data={movements}
        keyExtractor={m => m.id}
        ListEmptyComponent={<Card><Text style={styles.empty}>Henüz hareket bulunmuyor.</Text></Card>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.productName}>{item.product}</Text>
                <Text style={styles.muted}>{item.user} • {item.time} • {item.type}</Text>
              </View>
              <Text style={item.amount > 0 ? styles.in : styles.out}>
                {item.amount > 0 ? "+" : ""}{item.amount} {item.unit}
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

function Profile() {
  return (
    <View>
      <Header title="Profil" subtitle="Hesap ve yetkiler" />
      <Card>
        <Text style={styles.productName}>Mustafa Tarhan</Text>
        <Text style={styles.muted}>Yönetici</Text>
      </Card>
      <Card><Text style={styles.productName}>Ortak kullanım</Text><Text style={styles.muted}>Bulut veritabanı bağlandığında tüm çalışanlar aynı stokları görecek.</Text></Card>
    </View>
  );
}

function Stat({ label, value, danger }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={danger ? styles.dangerText : styles.muted}>{label}</Text></View>;
}
function Card({ children }) { return <View style={styles.card}>{children}</View>; }
function ProductRow({ product }) {
  return <Card><View style={styles.rowBetween}><View><Text style={styles.productName}>{product.name}</Text><Text style={styles.muted}>{product.category}</Text></View><Text style={styles.stockDanger}>{product.stock} {product.unit}</Text></View></Card>;
}
function Tab({ label, icon, active, onPress }) {
  return <Pressable style={styles.tab} onPress={onPress}><Text style={active ? styles.tabIconActive : styles.tabIcon}>{icon}</Text><Text style={active ? styles.tabTextActive : styles.tabText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F1E8" },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  flex: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  brand: { fontSize: 12, fontWeight: "800", letterSpacing: 2, color: "#76523B" },
  title: { fontSize: 25, fontWeight: "800", color: "#2F241D", marginTop: 4 },
  subtitle: { color: "#8A786A", marginTop: 3 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#3E2B20", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFF", fontWeight: "800", fontSize: 18 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: "#FFFDF9", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E8DDD1" },
  statValue: { fontSize: 28, fontWeight: "800", color: "#34251D" },
  muted: { color: "#8B7A6D", marginTop: 4 },
  dangerText: { color: "#A24B3A", marginTop: 4, fontWeight: "700" },
  bigScan: { backgroundColor: "#3E2B20", borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 18 },
  bigScanIcon: { color: "#FFF", fontSize: 42, marginRight: 16 },
  bigScanTitle: { color: "#FFF", fontWeight: "900", letterSpacing: 1 },
  bigScanSub: { color: "#D9C8B8", marginTop: 4 },
  section: { fontSize: 18, fontWeight: "800", color: "#3A2A20", marginVertical: 10 },
  card: { backgroundColor: "#FFFDF9", borderRadius: 17, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E8DDD1" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { fontSize: 16, fontWeight: "750", color: "#33251E" },
  stock: { color: "#3E2B20", fontSize: 20, fontWeight: "800", marginTop: 8 },
  stockDanger: { color: "#A24B3A", fontSize: 18, fontWeight: "800" },
  in: { color: "#3F7652", fontWeight: "800" },
  out: { color: "#A24B3A", fontWeight: "800" },
  empty: { color: "#8B7A6D", textAlign: "center", padding: 8 },
  tabbar: { height: 78, backgroundColor: "#FFFDF9", borderTopWidth: 1, borderTopColor: "#E8DDD1", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingBottom: 8 },
  tab: { alignItems: "center", minWidth: 54 },
  tabIcon: { color: "#9B897B", fontSize: 21 },
  tabIconActive: { color: "#3E2B20", fontSize: 21 },
  tabText: { color: "#9B897B", fontSize: 10, marginTop: 2 },
  tabTextActive: { color: "#3E2B20", fontSize: 10, fontWeight: "800", marginTop: 2 },
  scanButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#3E2B20", alignItems: "center", justifyContent: "center", marginTop: -24, borderWidth: 5, borderColor: "#F7F1E8" },
  scanIcon: { color: "#FFF", fontSize: 26 },
  scanText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
  search: { backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: "#E8DDD1", borderRadius: 14, padding: 14, marginBottom: 12, fontSize: 15 },
  miniButton: { backgroundColor: "#F0E6DA", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginVertical: 3 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  primary: { backgroundColor: "#3E2B20", paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, marginTop: 10 },
  primaryText: { color: "#FFF", fontWeight: "800" },
  secondary: { backgroundColor: "#EDE2D6", paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, marginTop: 10 },
  back: { color: "#76523B", fontWeight: "700", marginTop: 12 },
  scanResult: { fontWeight: "900", color: "#76523B", letterSpacing: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  cameraWrap: { flex: 1, marginHorizontal: -18 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.22)" },
  cameraTitle: { color: "#FFF", fontWeight: "800", fontSize: 17, marginBottom: 30 },
  scanFrame: { width: 280, height: 160, borderWidth: 3, borderColor: "#FFF", borderRadius: 18 },
  cameraBack: { marginTop: 40, backgroundColor: "rgba(62,43,32,0.9)", padding: 14, borderRadius: 12 }
});

export default App;
